const { AuditLog } = require('../models/platform/platformAssociations');

// Fire-and-forget audit write — never let a logging failure break the
// actual request. Call this from controllers after a state-changing action.
async function recordAudit({ req, organizationId = null, userId = null, action, entityType = null, entityId = null, metadata = null }) {
  try {
    await AuditLog.create({
      organizationId,
      userId: userId ?? req?.user?.id ?? null,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress: req?.ip || req?.headers?.['x-forwarded-for'] || null,
      userAgent: req?.headers?.['user-agent'] || null,
    });
  } catch (err) {
    console.error('Audit log write failed:', err.message);
  }
}

module.exports = { recordAudit };
