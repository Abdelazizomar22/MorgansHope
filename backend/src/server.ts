import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { DataTypes } from 'sequelize';

import sequelize from './config/database';
import passport from './config/passport';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerConfig from './config/swagger';
import User from './models/User';
import './models/City';
import './models/Hospital';
import './models/AnalysisResult';
import './models/ChatMessage';

import authRoutes from './routes/auth';
import analysisRoutes from './routes/analysis';
import hospitalRoutes from './routes/hospitals';
import chatRoutes from './routes/chat';

const app = express();
app.set('trust proxy', 1);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isDev = process.env.NODE_ENV !== 'production';
const isVercel = Boolean(process.env.VERCEL);
const CT_URL = process.env.CT_SERVICE_URL || 'http://localhost:8000';
const XRAY_URL = process.env.XRAY_SERVICE_URL || 'http://localhost:8001';

let initPromise: Promise<void> | null = null;

async function ensureUserAuthColumns() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable('users');
  const addIfMissing = async (name: string, definition: any) => {
    if (!table[name]) {
      await queryInterface.addColumn('users', name, definition);
      console.log(`[DB] Added users.${name}`);
    }
  };

  await addIfMissing('email_verified', { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false });
  await addIfMissing('phone_verified', { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false });
  await addIfMissing('accepted_disclaimer', { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false });
  await addIfMissing('onboarding_completed', { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false });
  await addIfMissing('auth_provider', { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'local' });
  await addIfMissing('verification_code', { type: DataTypes.STRING(12), allowNull: true });
  await addIfMissing('verification_channel', { type: DataTypes.STRING(20), allowNull: true });
  await addIfMissing('verification_expires_at', { type: DataTypes.DATE, allowNull: true });
  await addIfMissing('phone_otp_hash', { type: DataTypes.STRING(255), allowNull: true });
  await addIfMissing('phone_otp_expiry', { type: DataTypes.DATE, allowNull: true });
}

async function ensureHospitalColumns() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable('hospitals');
  const addIfMissing = async (name: string, definition: any) => {
    if (!table[name]) {
      await queryInterface.addColumn('hospitals', name, definition);
      console.log(`[DB] Added hospitals.${name}`);
    }
  };

  await addIfMissing('hospital_name_ar', { type: DataTypes.STRING(255), allowNull: true });
  await addIfMissing('specialization_ar', { type: DataTypes.STRING(255), allowNull: true });
  await addIfMissing('address_ar', { type: DataTypes.TEXT, allowNull: true });
  await addIfMissing('latitude', { type: DataTypes.DECIMAL(10, 6), allowNull: true });
  await addIfMissing('longitude', { type: DataTypes.DECIMAL(10, 6), allowNull: true });
  await addIfMissing('established_year', { type: DataTypes.INTEGER, allowNull: true });
  await addIfMissing('beds', { type: DataTypes.STRING(20), allowNull: true });
  await addIfMissing('expertise', { type: DataTypes.JSON, allowNull: true });
  await addIfMissing('services', { type: DataTypes.JSON, allowNull: true });
  await addIfMissing('type', { type: DataTypes.STRING(20), allowNull: true });
  await addIfMissing('booking_url', { type: DataTypes.STRING(500), allowNull: true });
  await addIfMissing('about', { type: DataTypes.TEXT, allowNull: true });
  await addIfMissing('about_ar', { type: DataTypes.TEXT, allowNull: true });
  await addIfMissing('google_maps', { type: DataTypes.STRING(500), allowNull: true });
  await addIfMissing('badge', { type: DataTypes.STRING(100), allowNull: true });
  await addIfMissing('badge_color', { type: DataTypes.STRING(20), allowNull: true });
  await addIfMissing('city_name', { type: DataTypes.STRING(100), allowNull: true });
  await addIfMissing('city_name_ar', { type: DataTypes.STRING(100), allowNull: true });
}

async function initializeApp() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    if (isVercel) {
      await sequelize.authenticate();
      await ensureUserAuthColumns();
      await ensureHospitalColumns();
      console.log('Database connection verified for Vercel runtime.');
      return;
    }

    await sequelize.sync();
    await ensureUserAuthColumns();
    await ensureHospitalColumns();
    console.log('Database tables synced.');

    const userCount = await User.count();
    if (userCount === 0) {
      const hashed = await bcrypt.hash('Admin@123456', 12);
      await User.create({
        firstName: 'Admin',
        lastName: 'MedTech',
        email: 'admin@medtech.com',
        password: hashed,
        role: 'admin',
      });
      console.log('Admin created: admin@medtech.com / Admin@123456');
    }
  })().catch((err) => {
    initPromise = null;
    console.error('Database sync failed:', err);
    throw err;
  });

  return initPromise;
}

app.use(helmet());

const normalizeOrigin = (origin: string) => origin.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');

const envOrigins = [
  process.env.FRONTEND_URLS || '',
  process.env.FRONTEND_URL || '',
]
  .flatMap((value) => value.split(','))
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const configuredOrigins = Array.from(
  new Set([
    'https://morgans-hope.vercel.app',
    'http://localhost:3001',
    ...envOrigins,
  ]),
);

const vercelPreviewPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

const isAllowedOrigin = (origin?: string) => {
  if (!origin || isDev) return true;
  const normalizedOrigin = normalizeOrigin(origin);
  return configuredOrigins.includes(normalizedOrigin) || vercelPreviewPattern.test(normalizedOrigin);
};

app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;

  if (!isAllowedOrigin(origin)) {
    res.status(403).json({ success: false, message: `CORS blocked for origin: ${origin}` });
    return;
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', normalizeOrigin(origin));
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

app.use(compression());
app.use(cookieParser());
app.use(passport.initialize());

app.use((_req, res, next) => {
  const id = uuidv4();
  res.setHeader('X-Request-ID', id);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Swagger API Docs ─────────────────────────────────────────
const swaggerSpec = swaggerJsdoc(swaggerConfig);
if (isDev) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Morgan's Hope API Docs",
  }));
}
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

if (!isDev) {
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many auth requests, please try again later.' },
  });

  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many registration attempts, please try again later.' },
  });

  const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many upload requests, please try again later.' },
  });

  app.use(globalLimiter);
  app.use('/api/auth', authLimiter);
  app.use('/api/auth/register', registerLimiter);
  app.use('/api/analysis/upload', uploadLimiter);
}

app.use(
  '/api/uploads',
  express.static(
    path.isAbsolute(process.env.UPLOAD_DIR || 'uploads')
      ? (process.env.UPLOAD_DIR as string)
      : path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
  ),
);

const healthHandler = async (_req: express.Request, res: express.Response) => {
  const check = async (url: string): Promise<string> => {
    try {
      await axios.get(`${url}/health`, { timeout: 3000 });
      return 'online';
    } catch {
      return 'offline';
    }
  };

  const checkDb = async (): Promise<string> => {
    try {
      await sequelize.authenticate();
      return 'online';
    } catch {
      return 'offline';
    }
  };

  const [ctStatus, xrayStatus, dbStatus] = await Promise.all([check(CT_URL), check(XRAY_URL), checkDb()]);

  res.json({
    success: true,
    data: {
      server: 'online',
      database: dbStatus,
      ai: { ctService: ctStatus, xrayService: xrayStatus },
      timestamp: new Date().toISOString(),
    },
  });
};

const rootHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: "Morgan's Hope backend is running.",
    data: {
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        analysis: '/api/analysis',
        hospitals: '/api/hospitals',
        chat: '/api/chat',
      },
    },
  });
};

/**
 * @openapi
 * /api:
 *   get:
 *     tags: [Health]
 *     summary: API root — list available endpoints
 *     security: []
 *     responses:
 *       200:
 *         description: Server info with endpoint list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
if (isDev) app.get('/', rootHandler);
app.get('/api', rootHandler);

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check — server, database, and AI service status
 *     security: []
 *     responses:
 *       200:
 *         description: Health status
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/HealthData' }
 */
if (isDev) app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.use(async (_req, _res, next) => {
  try {
    await initializeApp();
    next();
  } catch (err) {
    next(err);
  }
});

if (isDev) app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
if (isDev) app.use('/analysis', analysisRoutes);
app.use('/api/analysis', analysisRoutes);
if (isDev) app.use('/hospitals', hospitalRoutes);
app.use('/api/hospitals', hospitalRoutes);
if (isDev) app.use('/chat', chatRoutes);
app.use('/api/chat', chatRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = isDev ? err.message : (status < 500 ? err.message : 'Internal server error');

  if (status >= 500) {
    console.error(`[ERROR] ${err.message}`, err.stack);
  }

  res.status(status).json({ success: false, message });
});

if (!isVercel) {
  initializeApp()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Morgan's Hope Backend running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`CT Service: ${CT_URL}`);
        console.log(`XRay Service: ${XRAY_URL}`);
      });
    })
    .catch(() => {
      process.exit(1);
    });
}

export default app;
export { initializeApp };
