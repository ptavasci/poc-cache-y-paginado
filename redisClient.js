const redis = require('redis');

const redisClient = redis.createClient({
    host: '127.0.0.1',  // Dirección del host
    port: 6379         // Puerto de Redis
});

redisClient.connect().catch(err => {
    console.error('Error connecting to Redis:', err);
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

module.exports = redisClient;