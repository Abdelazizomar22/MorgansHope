import fs from 'fs';
import path from 'path';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { logger } from '../infrastructure/observability/logger';

async function run() {
  if (sequelize.getDialect() !== 'postgres') {
    throw new Error('Production SQL migrations require PostgreSQL.');
  }

  const migrationsDir = path.resolve(process.cwd(), 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.up.sql'))
    .sort();

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(100) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const rows = await sequelize.query<{ version: string }>('SELECT version FROM schema_migrations', {
    type: QueryTypes.SELECT,
  });
  const applied = new Set(rows.map((row) => row.version));

  for (const file of files) {
    const version = file.replace(/\.up\.sql$/, '');
    if (applied.has(version)) {
      logger.info({ migration: file }, 'Skipping already applied migration');
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    logger.info({ migration: file }, 'Applying database migration');
    await sequelize.query(sql);
  }

  await sequelize.close();
  logger.info('Database migrations completed');
}

run().catch((error) => {
  logger.fatal({ error }, 'Database migration failed');
  process.exit(1);
});
