const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./docs/swagger');
const routes = require('./routes/index');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const path = require('path');

// ─────────────────────────────────────────────
// Security headers
// ─────────────────────────────────────────────
app.use(
  helmet({
    // Allow Swagger UI to load its own scripts/styles
    contentSecurityPolicy: false,
  })
);

// ─────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  `http://localhost:${process.env.PORT || 5000}`, // Allow Swagger UI
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin) and listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin '${origin}' is not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─────────────────────────────────────────────
// Request logging — development only
// ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─────────────────────────────────────────────
// Body parsing
// ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────────────────────────────────────
// Static file serving
// ─────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─────────────────────────────────────────────
// Global rate limiting — applied to all /api routes
// ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
});

app.use('/api', limiter);

// ─────────────────────────────────────────────
// Swagger UI — API documentation
// ─────────────────────────────────────────────
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Campus Connect API Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #1e1b4b; }
      .swagger-ui .topbar-wrapper img { content: none; }
      .swagger-ui .topbar-wrapper::after {
        content: "Campus Connect API";
        color: white;
        font-size: 1.2rem;
        font-weight: 700;
        margin-left: 1rem;
      }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
    },
  })
);

// Serve raw spec as JSON (useful for external tooling)
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use('/api', routes);

// ─────────────────────────────────────────────
// 404 — must come after all valid routes
// ─────────────────────────────────────────────
app.use(notFound);

// ─────────────────────────────────────────────
// Central error handler — must be LAST
// ─────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
