const express = require('express');
const redisClient = require('./redisClient');

const paginationMiddleware = require('./paginationMiddleware');
const cacheMiddleware = require('./cacheMiddleware');
const getData = require('./mockedService');

const app = express();

// Hacer que el cliente Redis esté disponible para el middleware de caché
app.use((req, res, next) => {
    req.redisClient = redisClient;
    next();
});

app.use('/api', cacheMiddleware, paginationMiddleware);

app.get('/api/your-endpoint', (req, res) => {
    res.json(getData());
});

app.get('/api-sinpaginado', (req, res) => {
    res.json(getData());
});

app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});