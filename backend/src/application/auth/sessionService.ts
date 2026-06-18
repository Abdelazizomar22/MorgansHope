import crypto, { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import AuthSession from '../../models/AuthSession';
import User from '../../models/User';
import { env } from '../../config/env';

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const REMEMBERED_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export interface SessionMetadata {
  userAgent?: string;
  ip?: string;
}

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
const hashIp = (ip?: string) => (ip ? sha256(`${env.refreshSecret}:${ip}`) : null);

export function createAccessToken(userId: number, sessionId: string) {
  return jwt.sign(
    { sub: userId, sid: sessionId, type: 'access' },
    env.jwtSecret || 'development_only_jwt_secret_minimum_32_chars',
    { expiresIn: ACCESS_TOKEN_TTL_SECONDS, issuer: 'morgans-hope', audience: 'morgans-hope-web' },
  );
}

function createOpaqueRefreshToken(sessionId: string) {
  return `${sessionId}.${crypto.randomBytes(48).toString('base64url')}`;
}

export async function createSession(
  userId: number,
  rememberMe: boolean,
  metadata: SessionMetadata,
  familyId: string = randomUUID(),
) {
  const sessionId = randomUUID();
  const refreshToken = createOpaqueRefreshToken(sessionId);
  const ttl = rememberMe ? REMEMBERED_SESSION_TTL_SECONDS : SESSION_TTL_SECONDS;

  await AuthSession.create({
    id: sessionId,
    userId,
    familyId,
    tokenHash: sha256(refreshToken),
    userAgent: metadata.userAgent?.slice(0, 500) || null,
    ipHash: hashIp(metadata.ip),
    rememberMe,
    expiresAt: new Date(Date.now() + ttl * 1000),
  });

  return {
    accessToken: createAccessToken(userId, sessionId),
    refreshToken,
    accessMaxAgeMs: ACCESS_TOKEN_TTL_SECONDS * 1000,
    refreshMaxAgeMs: rememberMe ? REMEMBERED_SESSION_TTL_SECONDS * 1000 : undefined,
    sessionId,
  };
}

export async function rotateSession(refreshToken: string, metadata: SessionMetadata) {
  const [sessionId] = refreshToken.split('.');
  if (!sessionId) return null;
  const existing = await AuthSession.findByPk(sessionId);
  if (!existing) return null;

  if (existing.revokedAt) {
    await AuthSession.update(
      { revokedAt: new Date() },
      { where: { familyId: existing.familyId, revokedAt: null } },
    );
    return null;
  }

  const nextHash = sha256(refreshToken);
  if (
    existing.expiresAt.getTime() <= Date.now()
    || existing.tokenHash.length !== nextHash.length
    || !crypto.timingSafeEqual(Buffer.from(existing.tokenHash), Buffer.from(nextHash))
  ) {
    await existing.update({ revokedAt: new Date() });
    return null;
  }

  const user = await User.findOne({ where: { id: existing.userId, isActive: true } });
  if (!user) {
    await existing.update({ revokedAt: new Date() });
    return null;
  }

  const next = await createSession(existing.userId, existing.rememberMe, metadata, existing.familyId);
  await existing.update({ revokedAt: new Date(), replacedById: next.sessionId, lastUsedAt: new Date() });
  return { ...next, user };
}

export async function revokeSession(refreshToken?: string) {
  if (!refreshToken) return;
  const [sessionId] = refreshToken.split('.');
  if (sessionId) await AuthSession.update({ revokedAt: new Date() }, { where: { id: sessionId } });
}

export async function isSessionActive(sessionId: string, userId: number) {
  const session = await AuthSession.findOne({ where: { id: sessionId, userId, revokedAt: null } });
  return Boolean(session && session.expiresAt.getTime() > Date.now());
}
