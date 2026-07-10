require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const logger = require('./utils/logger');
const routes = require('./routes');
const prisma = require('./utils/prismaClient');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

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
