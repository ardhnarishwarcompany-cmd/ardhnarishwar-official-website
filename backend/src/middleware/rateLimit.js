// Minimal in-memory rate limiter for sensitive endpoints (login, register,
// password reset). Fine for a single-instance deployment; swap the `hits`
// Map for a Redis-backed store before running multiple backend instances.
const hits = new Map();

function rateLimit({ windowMs = 15 * 60 * 1000, max = 10 } = {}) {
  return function (req, res, next) {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const entry = hits.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }
    entry.count += 1;
    hits.set(key, entry);

    if (entry.count > max) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    next();
  };
}

module.exports = { rateLimit };
