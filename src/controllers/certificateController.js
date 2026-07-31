const certificateService = require('../services/certificateService');
const { sendServerError } = require('../utils/errors');

const isAppError = (error) => !error?.clientVersion;

async function listMyCertificates(req, res) {
  try {
    const certificates = await certificateService.getUserCertificates(req.user.id);
    res.json({ success: true, data: certificates });
  } catch (error) {
    sendServerError(res, error, 'List certificates error');
  }
}

async function getCourseCertificate(req, res) {
  try {
    const certificate = await certificateService.generateCourseCertificate(req.user.id, req.params.courseId);
    res.json({ success: true, data: certificate });
  } catch (error) {
    if (isAppError(error)) {
      return res.status(400).json({ success: false, error: error.message });
    }
    sendServerError(res, error, 'Get course certificate error');
  }
}

async function verifyCertificate(req, res) {
  try {
    const result = await certificateService.verifyCertificate(req.params.code);
    res.json({ success: true, ...result });
  } catch (error) {
    sendServerError(res, error, 'Verify certificate error');
  }
}

module.exports = {
  listMyCertificates,
  getCourseCertificate,
  verifyCertificate,
};
