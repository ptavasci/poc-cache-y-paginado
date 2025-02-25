const crypto = require('crypto');

async function cacheMiddleware(req, res, next) {
  const { limit, offset, traceId, ...restQuery } = req.query;
  const hash = crypto.createHash('md5').update(JSON.stringify({ ...restQuery, traceId })).digest('hex');
  const cacheKey = `cache:${req.originalUrl.split('?')[0]}:${hash}`;

  const redisTimeout = (promise, ms) => {
    let timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), ms));
    return Promise.race([promise, timeout]);
  };

  try {
    const cachedData = await redisTimeout(req.redisClient.get(cacheKey), 2000); // 2 seconds timeout

    if (cachedData) {
      console.info('Full data retrieved from Redis cache for traceId', traceId);
      req.cacheddata = JSON.parse(cachedData);
      return next();
    } else {
      console.info('Full data not found in Redis cache for traceId', traceId);
    }
  } catch (err) {
    console.error('Error retrieving data from Redis, bypassing cache:', err);
  }

  res.sendResponse = res.json;
  res.json = (body) => {
    if (res.locals.originaldata) {
      req.redisClient.setEx(cacheKey, 30 * 60, JSON.stringify(res.locals.originaldata)) // Cache for 30 minutes
        .catch(err => console.error('Error setting data to Redis:', err));
    }
    res.sendResponse(body);
  };

  next();
}

module.exports = cacheMiddleware;