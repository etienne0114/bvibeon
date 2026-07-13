const logger = require('./logger');
const { isTransient } = require('./prismaClient');

// Never forward raw Prisma/DB error text to the client (hostnames, driver
// internals). Log the real cause, respond with something the UI can show
// as-is — and mark connectivity blips as retryable so the frontend can
// offer a "Try again" affordance instead of a dead end.
function sendServerError(res, error, context) {
  logger.error(`${context}:`, error);
  const transient = isTransient(error);
  res.status(transient ? 503 : 500).json({
    success: false,
    error: transient
      ? 'We had trouble reaching the database. Please try again in a moment.'
      : 'Something went wrong on our side. Please try again.',
    retryable: transient,
  });
}

// Run a batch of independent, labeled async operations; a failure in one
// never sacrifices the others — it's logged and swapped for its fallback.
async function settleWithDefaults(entries) {
  const results = await Promise.allSettled(entries.map((e) => e.task()));
  const output = {};
  let hadFailure = false;
  results.forEach((result, i) => {
    const { key, fallback, label } = entries[i];
    if (result.status === 'fulfilled') {
      output[key] = result.value;
    } else {
      hadFailure = true;
      logger.error(`${label || key} failed, using fallback:`, result.reason);
      output[key] = fallback;
    }
  });
  return { ...output, hadFailure };
}

module.exports = { sendServerError, settleWithDefaults };
