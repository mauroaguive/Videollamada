const auditService = require('../services/auditService');

/**
 * Audit logging middleware.
 * Logs the specified action along with IP address and user agent
 * after the response has been sent (on the 'finish' event).
 * Only logs when the response status code indicates success (< 400).
 *
 * @param {string} action - Description of the action being audited
 * @returns {Function} Express middleware
 */
function auditMiddleware(action) {
  return async (req, res, next) => {
    // After response is sent, log the audit
    res.on('finish', async () => {
      if (res.statusCode < 400) {
        try {
          await auditService.log({
            appointmentId: req.params.id || req.params.appointmentId || null,
            actorType: req.user ? req.user.role : 'SISTEMA',
            actorId: req.user ? String(req.user.id) : 'system',
            action,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            metadata: null,
          });
        } catch (err) {
          console.error('Audit log error:', err.message);
        }
      }
    });
    next();
  };
}

module.exports = auditMiddleware;
