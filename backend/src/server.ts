import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

import sequelize from './config/database';
import passport from './config/passport';
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

async function initializeApp() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    if (isVercel) {
      await sequelize.authenticate();
      console.log('Database connection verified for Vercel runtime.');
      return;
    }

    await sequelize.sync();
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

const configuredOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  'https://morgans-hope.vercel.app,http://localhost:3001'
)
  .split(',')
  .map((origin) => origin.trim().replace(/^['"]|['"]$/g, ''))
  .filter(Boolean);

const vercelPreviewPattern = /^https:\/\/morgans-hope-[a-z0-9-]+\.vercel\.app$/i;

app.use(
  cors({
    origin: (origin, callback) => {
      if (isDev || !origin) {
        callback(null, true);
        return;
      }

      if (configuredOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

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

  app.use(globalLimiter);
  app.use('/api/auth', authLimiter);
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

app.get('/', rootHandler);
app.get('/api', rootHandler);
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.use(async (_req, _res, next) => {
  try {
    await initializeApp();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/analysis', analysisRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/hospitals', hospitalRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/chat', chatRoutes);
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
