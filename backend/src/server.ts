import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import axios from 'axios';

import sequelize, { usingSqlite } from './config/database';
import passport from './config/passport';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerConfig from './config/swagger';
import { env, isProduction, validateEnvironment } from './config/env';
import { csrfProtection } from './middleware/csrf';
import { parseCookies } from './middleware/cookies';
import { distributedRateLimit } from './middleware/distributedRateLimit';
import { requestContext } from './middleware/requestContext';
import { initializeSentry, captureException } from './infrastructure/observability/sentry';
import { logger, safeError } from './infrastructure/observability/logger';

import User from './models/User';
import './models/City';
import './models/Hospital';
import './models/AnalysisResult';
import './models/ChatMessage';
import './models/AuthSession';
import './models/VerificationChallenge';
import './models/AnalysisJob';
import './models/OutboxEvent';
import './models/AuditLog';

import authRoutes from './routes/auth';
import analysisRoutes from './routes/analysis';
import hospitalRoutes from './routes/hospitals';
import chatRoutes from './routes/chat';
import contactRoutes from './routes/contact';
import uploadRoutes from './routes/uploads';
import internalRoutes from './routes/internal';

validateEnvironment();
initializeSentry();

const app = express();
app.set('trust proxy', 1);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isDev = !isProduction;
const isVercel = Boolean(process.env.VERCEL);
const cleanServiceUrl = (value: string) => {
  let normalized = value.trim();
  if (
    normalized.length >= 2
    && ((normalized.startsWith('"') && normalized.endsWith('"'))
      || (normalized.startsWith("'") && normalized.endsWith("'")))
  ) {
    normalized = normalized.slice(1, -1);
  }
  while (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
  return normalized;
};

const CT_URL = cleanServiceUrl(process.env.CT_SERVICE_URL || 'http://localhost:8000');
const XRAY_URL = cleanServiceUrl(process.env.XRAY_SERVICE_URL || 'http://localhost:8001');
const GATE_URL = cleanServiceUrl(process.env.GATE_SERVICE_URL || '');
const NODULE_URL = cleanServiceUrl(process.env.NODULE_SERVICE_URL || '');

const normalizeOrigin = (origin: string) => {
  let normalized = origin.trim();
  if (
    normalized.length >= 2
    && ((normalized.startsWith('"') && normalized.endsWith('"'))
      || (normalized.startsWith("'") && normalized.endsWith("'")))
  ) {
    normalized = normalized.slice(1, -1);
  }

  let end = normalized.length;
  while (end > 0 && normalized.charCodeAt(end - 1) === 47) {
    end -= 1;
  }
  return normalized.slice(0, end);
};

const configuredOrigins = Array.from(new Set([
  env.frontendUrl,
  ...env.frontendUrls,
  ...(isDev ? ['http://localhost:3001'] : []),
].filter(Boolean)));

const allowedOrigins = new Set(configuredOrigins.map(normalizeOrigin));

let initPromise: Promise<void> | null = null;

async function initializeApp() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await sequelize.authenticate();

    if (usingSqlite) {
      await sequelize.sync();
      logger.info('SQLite schema synchronized for local development');
      return;
    }

    logger.info('Database connection verified');
  })().catch((error) => {
    initPromise = null;
    logger.error({ error: safeError(error) }, 'Database initialization failed');
    throw error;
  });

  return initPromise;
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
app.use(parseCookies);
app.use(csrfProtection);
app.use(passport.initialize());
app.use(requestContext);

app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;

  if (origin) {
    const normalized = normalizeOrigin(origin);
    if (!allowedOrigins.has(normalized)) {
      res.status(403).json({ success: false, message: `CORS blocked for origin: ${origin}` });
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', normalized);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => {
    (req as any).rawBody = buf.toString('utf8');
  },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const swaggerSpec = swaggerJsdoc(swaggerConfig);
if (isDev) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Morgan's Hope API Docs",
  }));
}
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

if (!env.enableDistributedRateLimit) {
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

  const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many upload requests, please try again later.' },
  });

  app.use(globalLimiter);
  app.use('/api/auth', authLimiter);
  app.use('/api/analysis/upload', uploadLimiter);
}

app.use('/api', distributedRateLimit('global'));

app.use(
  '/api/uploads',
  express.static(
    path.isAbsolute(process.env.UPLOAD_DIR || 'uploads')
      ? (process.env.UPLOAD_DIR as string)
      : path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
  ),
);

const checkRemoteService = async (url: string): Promise<string> => {
  try {
    await axios.get(`${url}/health`, {
      timeout: 3000,
      headers: env.aiInternalToken ? { 'x-ai-internal-token': env.aiInternalToken } : undefined,
    });
    return 'online';
  } catch {
    return 'offline';
  }
};

const rootHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: "Morgan's Hope backend is running.",
    data: {
      endpoints: {
        health: '/api/health',
        live: '/api/health/live',
        ready: '/api/health/ready',
        auth: '/api/auth',
        analysis: '/api/analysis',
        hospitals: '/api/hospitals',
        chat: '/api/chat',
        contact: '/api/contact',
        uploads: '/api/uploads',
      },
    },
  });
};

const liveHandler = (_req: express.Request, res: express.Response) => {
  res.json({ success: true, data: { server: 'online', timestamp: new Date().toISOString() } });
};

const readyHandler = async (_req: express.Request, res: express.Response) => {
  try {
    await initializeApp();
    res.json({ success: true, data: { server: 'ready', database: 'online', timestamp: new Date().toISOString() } });
  } catch {
    res.status(503).json({ success: false, message: 'Server is not ready yet.' });
  }
};

const healthHandler = async (_req: express.Request, res: express.Response) => {
  const [ctStatus, xrayStatus, gateStatus, noduleStatus] = await Promise.all([
    checkRemoteService(CT_URL),
    checkRemoteService(XRAY_URL),
    GATE_URL ? checkRemoteService(GATE_URL) : Promise.resolve('not_configured'),
    NODULE_URL ? checkRemoteService(NODULE_URL) : Promise.resolve('not_configured'),
  ]);

  let dbStatus = 'offline';
  try {
    await sequelize.authenticate();
    dbStatus = 'online';
  } catch {
    dbStatus = 'offline';
  }

  res.json({
    success: true,
    data: {
      server: 'online',
      database: dbStatus,
      ai: {
        ctService: ctStatus,
        xrayService: xrayStatus,
        gateService: gateStatus,
        noduleService: noduleStatus,
      },
      timestamp: new Date().toISOString(),
    },
  });
};

if (isDev) app.get('/', rootHandler);
app.get('/api', rootHandler);
if (isDev) app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/api/health/live', liveHandler);
app.get('/api/health/ready', readyHandler);

app.use(async (_req, _res, next) => {
  try {
    await initializeApp();
    next();
  } catch (error) {
    next(error);
  }
});

if (isDev) app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
if (isDev) app.use('/analysis', analysisRoutes);
app.use('/api/analysis', analysisRoutes);
if (isDev) app.use('/uploads', uploadRoutes);
app.use('/api/uploads', uploadRoutes);
if (isDev) app.use('/hospitals', hospitalRoutes);
app.use('/api/hospitals', hospitalRoutes);
if (isDev) app.use('/chat', chatRoutes);
app.use('/api/chat', chatRoutes);
if (isDev) app.use('/contact', contactRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/internal', internalRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = isDev ? err.message : (status < 500 ? err.message : 'Internal server error');

  if (status >= 500) {
    logger.error({
      error: safeError(err),
      requestId: (req as any).requestId,
      path: req.path,
      method: req.method,
    }, 'request_failed');
    captureException(err, {
      requestId: (req as any).requestId,
      path: req.path,
      method: req.method,
    });
  }

  res.status(status).json({ success: false, message });
});

if (!isVercel) {
  initializeApp()
    .then(() => {
      app.listen(PORT, () => {
        logger.info({
          port: PORT,
          environment: process.env.NODE_ENV || 'development',
          ctService: CT_URL,
          xrayService: XRAY_URL,
        }, 'Morgan\'s Hope backend started');
      });
    })
    .catch(() => {
      process.exit(1);
    });
}

export default app;
export { initializeApp };
