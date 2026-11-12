/**
 * Porque: la API necesita procesar las solicitudes de forma consistente.
 * Para qué: configurar middleware, rutas y manejo de errores HTTP.
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./docs/openapi');
const rutas = require('./routes');
const { noEncontrado, manejarErrores } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/openapi.json', (req, res) => res.json(openapi));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.get('/health', (req, res) => res.json({ estado: 'ok', hora: new Date().toISOString() }));
app.use('/api/v1', rutas);

app.use(noEncontrado);
app.use(manejarErrores);

module.exports = app;
