import rateLimit from 'express-rate-limit';

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || (15 * 60 * 1000));
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX || 300);

export const rateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  // Use user id when available to avoid shared-IP throttling after login
  keyGenerator: (req) => {
    try {
      if (req.user && (req.user.id || req.user._id)) {
        return String(req.user.id || req.user._id);
      }
    } catch {}
    return req.ip;
  },
  // Skip rate limiting for safe/read-only or non-API critical endpoints
  skip: (req) => {
    try {
      const method = (req.method || 'GET').toUpperCase();
      const path = req.path || '';
      const url = req.originalUrl || '';
      if (method === 'GET') return true; // don't throttle reads
      if (path.startsWith('/auth') || url.includes('/api/auth')) return true; // allow login/register
      if (url.includes('/api/docs') || url.includes('/api/health') || url.includes('/api/version')) return true;
      return false;
    } catch {
      return false;
    }
  },
  handler: (req, res) => {
    res.status(429).json({ success: false, message: 'Too many requests. Please wait and try again.' });
  }
});


