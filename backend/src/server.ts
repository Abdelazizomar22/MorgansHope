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
import User from './models/User';
import './models/City';
import './models/Hospital';
import './models/AnalysisResult';
import './models/ChatMessage';

import authRoutes from './routes/auth';
import analysisRoutes from './routes/analysis';
import hospitalRoutes from './routes/hospitals';
import chatRoutes from './routes/chat';

// ── App ──────────────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1);
const PORT = parseInt(process.env.PORT || '3000', 10);
const isDev = process.env.NODE_ENV !== 'production';

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS (allow credentials for HttpOnly cookie) ──────────────────────────────
app.use(
  cors({
    origin: isDev
      ? true
      : process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  })
);

// ── Compression (gzip all responses) ─────────────────────────────────────────
app.use(compression());

// ── Cookie parser ─────────────────────────────────────────────────────────────
app.use(cookieParser());

// ── Request ID tracing ────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  const id = uuidv4();
  res.setHeader('X-Request-ID', id);
  next();
});

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate limiting (production only) ──────────────────────────────────────────
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

// ── Static: serve uploaded images ────────────────────────────────────────────
app.use(
  '/api/uploads',
  express.static(path.join(process.cwd(), 'uploads'))
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/chat', chatRoutes);

// ── Health ────────────────────────────────────────────────────────────────────
const CT_URL = process.env.CT_SERVICE_URL || 'http://localhost:8000';
const XRAY_URL = process.env.XRAY_SERVICE_URL || 'http://localhost:8001';

app.get('/api/health', async (_req, res) => {
  const check = async (url: string): Promise<string> => {
    try {
      await axios.get(`${url}/health`, { timeout: 3000 });
      return 'online';
    } catch {
      return 'offline';
    }
  };

  const [ctStatus, xrayStatus] = await Promise.all([check(CT_URL), check(XRAY_URL)]);

  res.json({
    success: true,
    data: {
      server: 'online',
      ai: { ctService: ctStatus, xrayService: xrayStatus },
      timestamp: new Date().toISOString(),
    },
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = isDev ? err.message : (status < 500 ? err.message : 'Internal server error');

  if (status >= 500) {
    console.error(`[ERROR] ${err.message}`, err.stack);
  }

  res.status(status).json({ success: false, message });
});

async function start() {
  try {
    await sequelize.sync();
    console.log('✅ Database tables synced.');
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
      console.log('✅ Admin created: admin@medtech.com / Admin@123456');
    }
  } catch (err) {
    console.error('❌ Database sync failed:', err);
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 Morgan's Hope Backend running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   CT  Service : ${CT_URL}`);
    console.log(`   XRay Service: ${XRAY_URL}\n`);
  });
}

start();

export default app;
