const { AuditLog, User } = require('../models/platform/platformAssociations');

function paginate(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(query.limit, 10) || 50));
  return { page, limit, offset: (page - 1) * limit };
}

async function list(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = {};
    // Non-super-admins only ever see their own organization's log (scoped
    // by requireOrganization upstream); super admins may pass ?organizationId=
    if (!req.user?.isSuperAdmin) where.organizationId = req.organizationId;
    else if (req.query.organizationId) where.organizationId = req.query.organizationId;

    if (req.query.action) where.action = req.query.action;

    const { rows, count } = await AuditLog.findAndCountAll({
      where, limit, offset, order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'], required: false }],
    });
    res.json({ data: rows, page, limit, total: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load audit log.', details: err.message });
  }
}

module.exports = { list };
