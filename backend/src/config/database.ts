import path from 'path';
import fs from 'fs';
import pg from 'pg';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { env } from './env';
dotenv.config();

const useSqlite =
  process.env.NODE_ENV !== 'production' &&
  (process.env.USE_SQLITE === '1' ||
    process.env.USE_SQLITE === 'true' ||
    process.env.USE_SQLITE === undefined);

export const usingSqlite = useSqlite;

let sequelize: Sequelize;

if (useSqlite) {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const storage = path.join(dataDir, 'dev.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: { underscored: true, timestamps: true },
  });
  if (process.env.NODE_ENV === 'development') {
    console.log('[DB] Using SQLite:', storage);
  }
} else {
  const commonOptions = {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      dialectOptions:
        process.env.NODE_ENV === 'production'
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
      dialectModule: pg,
      logging: false,
      pool: {
        max: Number(process.env.DB_POOL_MAX) || (process.env.VERCEL ? 2 : 5),
        min: 0,
        acquire: 15000,
        idle: 5000,
        evict: 10000,
      },
      define: { underscored: true, timestamps: true },
  } as const;

  sequelize = env.databaseUrl
    ? new Sequelize(env.databaseUrl, commonOptions as any)
    : new Sequelize(
      process.env.DB_NAME || 'morgans_hope',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      commonOptions as any,
    );
}

export default sequelize;
