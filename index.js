const express = require('express');
const redis = require('redis');

const paginationMiddleware = require('./paginationMiddleware');
const cacheMiddleware = require('./cacheMiddleware');
const app = express();

// Crear el cliente de Redis
const redisClient = redis.createClient({
    host: '127.0.0.1',  // Dirección del host
    port: 6379         // Puerto de Redis
});

redisClient.connect();

redisClient.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

// Hacer que el cliente Redis esté disponible para el middleware de caché
app.use((req, res, next) => {
    req.redisClient = redisClient;
    next();
});

app.use('/api', cacheMiddleware, paginationMiddleware);

app.get('/api/your-endpoint', (req, res) => {
    console.info('Recuperando data de la DB');

    const data = getData();

    res.json(data);
});

app.get('/api-sinpaginado', (req, res) => {
    console.info('Recuperando data de la DB');

    const data = getData();

    res.json(data);
});


app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});

function getData() {
    const currentSeconds = new Date().getSeconds();
    const fixedElements = 100;
    const totalElements = fixedElements + currentSeconds;

    const data = Array.from({ length: totalElements }, (_, i) => (i + 1).toString());
    return data;
}
