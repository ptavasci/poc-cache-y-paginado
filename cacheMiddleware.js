const crypto = require('crypto');

async function cacheMiddleware(req, res, next) {
    const { limit, offset, ...restQuery } = req.query;
    const hash = crypto.createHash('md5').update(JSON.stringify(restQuery)).digest('hex');
    const cacheKey = `cache:${req.originalUrl.split('?')[0]}:${hash}`;

    //falta mejorar el hash para que se base en un identificador de traza que provenga desde el front para diferenciar las requests que provienen del paginado de las que provienen del botón buscar

    try {
        const cachedData = await req.redisClient.get(cacheKey);

        if (cachedData) {
            console.info('Data retrieved from Redis cache');
            req.cacheddata = JSON.parse(cachedData);
            return next();
        } else {
            console.info('Data not found in Redis cache');
        }

        res.sendResponse = res.json;
        res.json = (body) => {
            req.redisClient.setEx(cacheKey, 60, JSON.stringify(res.locals.originaldata)); // Cache for 60 seconds
            res.sendResponse(body);
        };

        next();
    } catch (err) {
        console.error('Error retrieving data from Redis:', err);
        next();
    }
}

module.exports = cacheMiddleware;