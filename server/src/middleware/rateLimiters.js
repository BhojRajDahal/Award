import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { env } from '../config/env.js';

const jsonMessage = (msg) => ({ msg });

const loginFailureMax =
  env.AUTH_LOGIN_MAX ?? (env.NODE_ENV === 'production' ? 40 : 120);

const resetPasswordFailureMax = env.AUTH_RESET_PASSWORD_MAX ?? 15;

/** Per IP + normalized email; IPv6-safe via library helper (avoids ERR_ERL_KEY_GEN_IPV6). */
function loginKeyGenerator(req) {
  const ip = req.ip ?? req.socket?.remoteAddress ?? '';
  const ipKey = ipKeyGenerator(ip, 56);
  const raw = req.body?.email;
  const email =
    typeof raw === 'string' ? raw.toLowerCase().trim().slice(0, 256) : '';
  return `${ipKey}:${email || 'no-email'}`;
}

function createLoginRateLimiter() {
  return rateLimit({
    windowMs: env.AUTH_LOGIN_WINDOW_MS,
    max: loginFailureMax,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: loginKeyGenerator,
    handler: (_req, res) =>
      res.status(429).json(jsonMessage('Too many authentication attempts. Please try again later.')),
  });
}

/** Separate stores: failures on one route do not consume quota on another. */
export const loginLimiterAuth = createLoginRateLimiter();
export const loginLimiterAdmin = createLoginRateLimiter();
export const loginLimiterEvaluator = createLoginRateLimiter();

/** Token submission abuse; IP-scoped (body has token, not email). Independent from login buckets. */
export const passwordResetAttemptLimiter = rateLimit({
  windowMs: env.AUTH_RESET_PASSWORD_WINDOW_MS,
  max: resetPasswordFailureMax,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json(jsonMessage('Too many password reset attempts. Please try again later.')),
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json(jsonMessage('Too many reset requests. Please try again later.')),
});

export const adminLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json(jsonMessage('Too many admin requests. Please slow down.')),
});
