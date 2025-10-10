import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandlers.js';
import apiRoutes from './routes/index.js';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Sanitize data
app.use(mongoSanitize());

// Rate limiting
// Trust proxies so rate limiter sees correct client IP behind reverse proxies
app.set('trust proxy', 1);
app.use('/api', rateLimiter);

// Routes
app.use('/api', apiRoutes);

// Version endpoint
app.get('/api/version', (req, res) => {
  res.json({
    name: 'web_app-backend',
    version: process.env.npm_package_version || '1.0.0',
    env: process.env.NODE_ENV || 'development'
  });
});

// Swagger UI (optional) - load via createRequire for CJS packages compatibility
try {
  const require = createRequire(import.meta.url);
  const swaggerUi = require('swagger-ui-express');
  const YAML = require('yamljs');
  const specPath = new URL('./docs/openapi.yaml', import.meta.url).pathname;
  const openapiSpec = YAML.load(specPath);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
} catch (e) {
  // ignore if not available in runtime
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- SPA static hosting and client-side routing fallback ---
// Resolve path to the built frontend assets
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

// Serve static files from the frontend build directory
app.use(express.static(frontendDistPath));

// For any non-API route, send back index.html so React Router can handle it
app.get('*', (req, res, next) => {
	if (req.path.startsWith('/api')) return next();
	res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;


