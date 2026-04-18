import path from 'path';
import fs from 'fs';
import pg from 'pg';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const useSqlite =
  process.env.NODE_ENV !== 'production' &&
  (process.env.USE_SQLITE === '1' ||
    process.env.USE_SQLITE === 'true' ||
    process.env.USE_SQLITE === undefined);

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
  sequelize = new Sequelize(
    process.env.DB_NAME || 'medtech_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      dialectOptions:
        process.env.NODE_ENV === 'production'
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
      dialectModule: pg,
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      define: { underscored: true, timestamps: true },
    }
  );
}

export default sequelize;
