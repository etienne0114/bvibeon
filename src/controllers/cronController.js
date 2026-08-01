const progressService = require('../services/progressService');
const logger = require('../utils/logger');
const { sendServerError } = require('../utils/errors');

// Fail closed: if CRON_SECRET isn't configured, no request can pass — never
// fall back to an open endpoint (the same hardcoded-fallback mistake fixed
// elsewhere in this codebase for JWT/translator secrets).
function isAuthorizedCronRequest(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.authorization === `Bearer ${secret}`;
}

async function runReEngagementSweep(req, res) {
  if (!isAuthorizedCronRequest(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  try {
    const result = await progressService.sendReEngagementEmails();
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Re-engagement cron error:', error);
    sendServerError(res, error, 'Re-engagement cron error');
  }
}

module.exports = { runReEngagementSweep };
