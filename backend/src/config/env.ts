const requiredInProduction = [
  'JWT_SECRET',
  'REFRESH_SECRET',
  'OTP_PEPPER',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
] as const;

const read = (name: string, fallback = '') => (process.env[name] || fallback).trim();

const trimTrailingSlashes = (value: string) => {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47) {
    end -= 1;
  }
  return value.slice(0, end);
};

const cleanServiceUrl = (value: string) => {
  let normalized = value.trim();
  if (
    normalized.length >= 2
    && ((normalized.startsWith('"') && normalized.endsWith('"'))
      || (normalized.startsWith("'") && normalized.endsWith("'")))
  ) {
    normalized = normalized.slice(1, -1);
  }

  try {
    const parsed = new URL(normalized);
    const spaceMatch = parsed.hostname === 'huggingface.co'
      ? parsed.pathname.match(/^\/spaces\/([^/]+)\/([^/]+)/)
      : null;

    if (spaceMatch) {
      const [, owner, space] = spaceMatch;
      return `https://${owner}-${space}`.toLowerCase() + '.hf.space';
    }

    const path = parsed.pathname.replace(/\/+$/, '');
    const suffixes = ['/predict/xray', '/predict', '/detect', '/health', '/'];
    const matched = suffixes.find((suffix) => path.endsWith(suffix) && path !== suffix);
    if (matched) {
      parsed.pathname = path.slice(0, -matched.length) || '/';
    } else {
      parsed.pathname = path || '/';
    }
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    while (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
    return normalized;
  }
};

const readServiceUrl = (name: string, fallback = '', unifiedFallback = '') => cleanServiceUrl(read(name, unifiedFallback || fallback));

export const env = {
  nodeEnv: read('NODE_ENV', 'development'),
  frontendUrl: trimTrailingSlashes(read('FRONTEND_URL', 'http://localhost:3001')),
  frontendUrls: read('FRONTEND_URLS')
    .split(',')
    .map((value) => trimTrailingSlashes(value.trim()))
    .filter(Boolean),
  jwtSecret: read('JWT_SECRET'),
  refreshSecret: read('REFRESH_SECRET'),
  otpPepper: read('OTP_PEPPER'),
  csrfSecret: read('CSRF_SECRET'),
  // Vercel routes /api through the frontend host, so auth cookies must remain host-only.
  cookieDomain: process.env.VERCEL ? undefined : (read('COOKIE_DOMAIN') || undefined),
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
  aiServicesUrl: cleanServiceUrl(read('AI_SERVICES_URL')),
  ctServiceUrl: readServiceUrl('CT_SERVICE_URL', 'http://localhost:8000', read('AI_SERVICES_URL')),
  xrayServiceUrl: readServiceUrl('XRAY_SERVICE_URL', 'http://localhost:8001', read('AI_SERVICES_URL')),
  gateServiceUrl: readServiceUrl('GATE_SERVICE_URL', '', read('AI_SERVICES_URL')),
  noduleServiceUrl: readServiceUrl('NODULE_SERVICE_URL', '', read('AI_SERVICES_URL')),
  turnstileSecret: read('TURNSTILE_SECRET_KEY'),
  contactEmail: read('CONTACT_EMAIL', 'morganshope40@gmail.com'),
  smtpHost: read('SMTP_HOST'),
  smtpPort: Number(read('SMTP_PORT', '587')),
  smtpSecure: read('SMTP_SECURE') === 'true',
  smtpUser: read('SMTP_USER'),
  smtpPass: read('SMTP_PASS'),
  smtpFrom: read('SMTP_FROM'),
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
    ['OTP_PEPPER', env.otpPepper],
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
