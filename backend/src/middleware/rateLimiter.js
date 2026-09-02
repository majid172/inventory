// ============================================================================
// PharmaCare SaaS — Enterprise In-Memory Rate Limiter Middleware
// Zero external dependency, IP-based sliding window rate limiter
// ============================================================================

const requestLogs = new Map();

// Periodically clean up expired IP entries every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestLogs.entries()) {
    if (now > record.resetTime) {
      requestLogs.delete(key);
    }
  }
}, 2 * 60 * 1000);

/**
 * Creates a rate limiting middleware function
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (Default: 60,000ms = 1 minute)
 * @param {number} options.max - Maximum requests allowed per window (Default: 5)
 * @param {string} options.message - Error message when limit is exceeded
 */
const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute default
  const maxRequests = options.max !== undefined ? options.max : 5; // 5 requests default
  const errorMessage = options.message || `⚠️ Too many requests! You have exceeded the maximum limit of ${maxRequests} requests per minute. Please wait a minute and try again.`;

  return (req, res, next) => {
    // Determine client IP
    const clientIp = 
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.headers['x-real-ip'] ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const key = `${clientIp}:${req.baseUrl || ''}${req.path}`;
    const now = Date.now();

    let record = requestLogs.get(key);

    if (!record || now > record.resetTime) {
      // First request or window expired
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      requestLogs.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);

    // Set standard RateLimit HTTP headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: errorMessage,
        retryAfter: `${retryAfterSec} seconds`,
        retryAfterSeconds: retryAfterSec
      });
    }

    next();
  };
};

// Preset: 1 minute, maximum 5 attempts (Strict for Auth / Registration)
const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: '⚠️ Too many attempts! You can only make 5 attempts per minute. Please try again after 1 minute.'
});

// Preset: 1 minute, maximum 30 requests (For general APIs)
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: '⚠️ API rate limit exceeded. Maximum 60 requests per minute allowed.'
});

module.exports = {
  createRateLimiter,
  authLimiter,
  apiLimiter
};
