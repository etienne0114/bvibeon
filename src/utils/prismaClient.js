const { PrismaClient } = require('@prisma/client');

// Reuse a single client across serverless invocations and hot reloads —
// each PrismaClient owns a connection pool, and spawning one per invocation
// exhausts the database's connection slots under load.
const globalForPrisma = globalThis;

const base =
  globalForPrisma.__vibeonPrismaBase ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
  });
globalForPrisma.__vibeonPrismaBase = base;

// Transient pooler/network failures (pgbouncer restarts, dropped sockets,
// brief connectivity blips) surface as these Prisma error codes/messages.
// Reads are safe to retry with backoff; writes are not blanket-retried to
// avoid duplicating effects.
const TRANSIENT_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017']);
const TRANSIENT_MESSAGE = /Response from the Engine was empty|Can't reach database server|Connection reset|ECONNRESET|Timed out/i;
const RETRYABLE_ACTIONS = new Set([
  'findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow',
  'findMany', 'count', 'aggregate', 'groupBy', 'queryRaw',
]);

const isTransient = (error) => TRANSIENT_CODES.has(error?.code) || TRANSIENT_MESSAGE.test(String(error?.message || ''));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Total retry budget ~2.7s — enough to ride out a short blip without making
// a hung request feel like a frozen page.
const BACKOFF_MS = [300, 600, 900];

const prisma =
  globalForPrisma.__vibeonPrisma ||
  base.$extends({
    query: {
      async $allOperations({ operation, args, query }) {
        const retryable = RETRYABLE_ACTIONS.has(operation);
        let lastError;
        for (let attempt = 0; attempt <= (retryable ? BACKOFF_MS.length : 0); attempt += 1) {
          try {
            return await query(args);
          } catch (error) {
            lastError = error;
            if (!retryable || !isTransient(error)) throw error;
            if (attempt < BACKOFF_MS.length) await sleep(BACKOFF_MS[attempt]);
          }
        }
        throw lastError;
      },
    },
  });

globalForPrisma.__vibeonPrisma = prisma;
module.exports = prisma;
module.exports.isTransient = isTransient;
