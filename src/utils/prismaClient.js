const { PrismaClient } = require('@prisma/client');

// Reuse a single client across serverless invocations and hot reloads —
// each PrismaClient owns a connection pool, and spawning one per invocation
// exhausts the database's connection slots under load.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__vibeonPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
  });

globalForPrisma.__vibeonPrisma = prisma;

module.exports = prisma;
