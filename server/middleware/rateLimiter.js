const { RateLimiterMemory } = require('rate-limiter-flexible');

const limiter = new RateLimiterMemory({
  points: 100,      
  duration: 60,      
});

const rateLimiter = async (req, res, next) => {
  try {
    await limiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }
};

module.exports = { rateLimiter };
