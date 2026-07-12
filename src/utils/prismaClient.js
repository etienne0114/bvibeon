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

// Transient pooler/network failures (pgbouncer restarts, dropped sockets)
// surface as these errors. Reads are safe to retry; writes are not blanket-
// retried to avoid duplicating effects.
const TRANSIENT = [/Response from the Engine was empty/i, /Can't reach database server/i, /Connection reset/i, /ECONNRESET/i, /Timed out/i];
const RETRYABLE_ACTIONS = new Set([
  'findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow',
  'findMany', 'count', 'aggregate', 'groupBy', 'queryRaw',
]);

const isTransient = (error) => TRANSIENT.some((re) => re.test(String(error?.message || '')));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const prisma =
  globalForPrisma.__vibeonPrisma ||
  base.$extends({
    query: {
      async $allOperations({ operation, args, query }) {
        const retryable = RETRYABLE_ACTIONS.has(operation);
        let lastError;
        for (let attempt = 0; attempt <= (retryable ? 2 : 0); attempt += 1) {
          try {
            return await query(args);
          } catch (error) {
            lastError = error;
            if (!retryable || !isTransient(error)) throw error;
            await sleep(200 * (attempt + 1));
          }
        }
        throw lastError;
      },
    },
  });

globalForPrisma.__vibeonPrisma = prisma;

module.exports = prisma;
