require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const logger = require('./utils/logger');
const routes = require('./routes');
const prisma = require('./utils/prismaClient');

const app = express();
// Behind Vercel/most proxies: needed so rate limiting sees the real client IP
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

// Safety net: if something upstream (DB, a slow dependency) hangs instead of
// erroring, cut the request loose after 20s with a clean, retryable response
// rather than leaving the client's request pending indefinitely.
app.use((req, res, next) => {
  req.setTimeout(20000, () => {
    if (!res.headersSent) {
      res.status(503).json({ success: false, error: 'The request took too long. Please try again.', retryable: true });
    }
  });
  next();
});

// Broad safety-net limit per IP; auth routes carry their own tighter limits
app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, slow down.' },
  }),
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', routes);

// On Vercel the app runs as a serverless function; only listen locally
if (!process.env.VERCEL) {
  const port = parseInt(process.env.PORT || '4100', 10);
  const server = app.listen(port, () => {
    logger.info(`Learn backend started on http://localhost:${port}`);
  });

  const shutdown = async () => {
    logger.info('Shutting down');
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

module.exports = app;
