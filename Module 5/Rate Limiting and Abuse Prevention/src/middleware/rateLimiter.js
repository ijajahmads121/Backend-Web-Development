'use strict';

const rateLimit = require('express-rate-limit');

const windowMs = 15 * 60 * 1000;

module.exports = rateLimit({
  windowMs,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    const resetTime = req.rateLimit && req.rateLimit.resetTime;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil(((resetTime instanceof Date ? resetTime.getTime() : Date.now() + windowMs) - Date.now()) / 1000),
    );

    res.setHeader('Retry-After', String(retryAfterSeconds));
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  },
});

// For a multi-instance deployment, rate-limit-redis can replace the default
// in-memory store (for example, with a RedisStore connected to a shared Redis
// client). Each app instance otherwise has an independent counter; behind a load
// balancer, a client spread across N instances could effectively get N times the
// configured limit. A shared Redis store keeps the counter consistent cluster-wide.
