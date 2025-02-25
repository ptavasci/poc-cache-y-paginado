const express = require('express');
const redisClient = require('./redisClient');

const paginationMiddleware = require('./paginationMiddleware');
const cacheMiddleware = require('./cacheMiddleware');
const app = express();

// Hacer que el cliente Redis esté disponible para el middleware de caché
app.use((req, res, next) => {
    req.redisClient = redisClient;
    next();
});

app.use('/api', cacheMiddleware, paginationMiddleware);

app.get('/api/your-endpoint', (req, res) => {
    console.info('Recuperando data de la DB');

    const currentSeconds = new Date().getSeconds();
    const fixedElements = 100;
    const totalElements = fixedElements + currentSeconds;

    const data = Array.from({ length: totalElements }, (_, i) => (i + 1).toString());

    res.json(data);
});

app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});