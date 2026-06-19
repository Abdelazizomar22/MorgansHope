const requiredInProduction = [
  'JWT_SECRET',
  'REFRESH_SECRET',
] as const;

const read = (name: string, fallback = '') => (process.env[name] || fallback).trim();

const trimTrailingSlashes = (value: string) => {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47) {
    end -= 1;
  }
  return value.slice(0, end);
};

export const env = {
  nodeEnv: read('NODE_ENV', 'development'),
  frontendUrl: trimTrailingSlashes(read('FRONTEND_URL', 'http://localhost:3001')),
  frontendUrls: read('FRONTEND_URLS')
    .split(',')
    .map((value) => trimTrailingSlashes(value.trim()))
    .filter(Boolean),
  jwtSecret: read('JWT_SECRET'),
  refreshSecret: read('REFRESH_SECRET'),
  csrfSecret: read('CSRF_SECRET'),
  cookieDomain: read('COOKIE_DOMAIN') || undefined,
  databaseUrl: read('DATABASE_URL'),
  supabaseUrl: read('SUPABASE_URL'),
  supabaseServiceRoleKey: read('SUPABASE_SERVICE_ROLE_KEY'),
  supabaseAnonKey: read('SUPABASE_ANON_KEY'),
  medicalScansBucket: read('MEDICAL_SCANS_BUCKET', 'medical-scans'),
  avatarsBucket: read('AVATARS_BUCKET', 'avatars'),
  upstashRedisUrl: read('UPSTASH_REDIS_REST_URL'),
  upstashRedisToken: read('UPSTASH_REDIS_REST_TOKEN'),
  qstashToken: read('QSTASH_TOKEN'),
  qstashCurrentSigningKey: read('QSTASH_CURRENT_SIGNING_KEY'),
  qstashNextSigningKey: read('QSTASH_NEXT_SIGNING_KEY'),
  qstashWorkerUrl: read('QSTASH_WORKER_URL'),
  sentryDsn: read('SENTRY_DSN'),
  aiInternalToken: read('AI_INTERNAL_TOKEN'),
  turnstileSecret: read('TURNSTILE_SECRET_KEY'),
  contactEmail: read('CONTACT_EMAIL', 'morganshope40@gmail.com'),
  enableAsyncAnalysis: read('ENABLE_ASYNC_ANALYSIS') === 'true',
  enableDistributedRateLimit: read('ENABLE_DISTRIBUTED_RATE_LIMIT') === 'true',
  enableSentry: read('ENABLE_SENTRY') !== 'false',
};

export const isProduction = env.nodeEnv === 'production';

export function validateEnvironment() {
  if (!isProduction) return;

  const missing = requiredInProduction.filter((name) => !read(name));
  const hasDatabaseUrl = Boolean(env.databaseUrl);
  const hasDbParts = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'].every((name) => read(name));
  const unsafeSecrets = [
    ['JWT_SECRET', env.jwtSecret],
    ['REFRESH_SECRET', env.refreshSecret],
  ].filter(([, value]) => value.length < 32 || /change|example|secret/i.test(value));

  if (missing.length || unsafeSecrets.length || (!hasDatabaseUrl && !hasDbParts)) {
    const problems = [
      missing.length ? `missing: ${missing.join(', ')}` : '',
      unsafeSecrets.length ? `unsafe: ${unsafeSecrets.map(([name]) => name).join(', ')}` : '',
      !hasDatabaseUrl && !hasDbParts ? 'missing: DATABASE_URL or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD' : '',
    ].filter(Boolean);
    throw new Error(`Production environment validation failed (${problems.join('; ')})`);
  }

  if (env.enableAsyncAnalysis) {
    const asyncMissing = [
      ['SUPABASE_URL', env.supabaseUrl],
      ['SUPABASE_SERVICE_ROLE_KEY', env.supabaseServiceRoleKey],
      ['QSTASH_TOKEN', env.qstashToken],
      ['QSTASH_CURRENT_SIGNING_KEY', env.qstashCurrentSigningKey],
      ['QSTASH_NEXT_SIGNING_KEY', env.qstashNextSigningKey],
      ['QSTASH_WORKER_URL', env.qstashWorkerUrl],
    ].filter(([, value]) => !value);
    if (asyncMissing.length) {
      throw new Error(`Async analysis is enabled but missing: ${asyncMissing.map(([name]) => name).join(', ')}`);
    }
  }
}
