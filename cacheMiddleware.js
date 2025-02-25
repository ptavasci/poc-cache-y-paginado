const crypto = require('crypto');

async function cacheMiddleware(req, res, next) {
  const { limit, offset, traceId, ...restQuery } = req.query;
  const hash = crypto.createHash('md5').update(JSON.stringify({ ...restQuery, traceId })).digest('hex');
  const cacheKey = `cache:${req.originalUrl.split('?')[0]}:${hash}`;

  try {
    const cachedData = await req.redisClient.get(cacheKey);

    if (cachedData) {
      console.info('Full data retrieved from Redis cache');
      req.cacheddata = JSON.parse(cachedData);
      return next();
    } else {
      console.info('Full data not found in Redis cache');
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
  } catch (err) {
    console.error('Error retrieving data from Redis:', err);
    next();
  }
}

module.exports = cacheMiddleware;