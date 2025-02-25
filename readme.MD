# Introducción

Este proyecto tiene por objetivo lograr un paginado que mediante un identificador de traza que proviene de un frontend, distingue las peticiones de un botón de búsqueda (inicial) de las requests que provienen de interactuar con el paginado de una grilla o lista, almacenando en un redis externo el total de datos de dicha request, de modo que en subsiguientes requests que provengan del paginado se mantengan la cantidad de registros devueltos por la API.

Para probarlo requiere tener el contenedor de Redis levantado en localhost, según el docker-compose.yml incluido en el repositorio.

![alt text](<Cache + Paginado.png>)