const { Organization, OrganizationUser, User, Role } = require('../models/platform/platformAssociations');
const { recordAudit } = require('../utils/audit');

function paginate(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit, offset: (page - 1) * limit };
}

// Only a super admin reaches these (see organizationRoutes.js) — regular
// org admins manage their own org through /api/organizations/:id (self).
async function list(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;
    const { rows, count } = await Organization.findAndCountAll({ where, limit, offset, order: [['createdAt', 'DESC']] });
    res.json({ data: rows, page, limit, total: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list organizations.', details: err.message });
  }
}

async function get(req, res) {
  try {
    const org = await Organization.findByPk(req.params.id, {
      include: [{ association: 'members', through: { attributes: ['roleId', 'status', 'isOwner'] } }],
    });
    if (!org) return res.status(404).json({ error: 'Organization not found.' });
    res.json(org);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load organization.', details: err.message });
  }
}

async function create(req, res) {
  try {
    const { name, slug, email, phone, website, industry, address, city, state, country } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'name and slug are required.' });

    const org = await Organization.create({ name, slug, email, phone, website, industry, address, city, state, country, createdBy: req.user?.id || null });
    await recordAudit({ req, organizationId: org.id, action: 'ORGANIZATION_CREATED', entityType: 'Organization', entityId: org.id });
    res.status(201).json(org);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create organization.', details: err.message });
  }
}

async function update(req, res) {
  try {
    const org = await Organization.findByPk(req.params.id);
    if (!org) return res.status(404).json({ error: 'Organization not found.' });
    const fields = ['name', 'email', 'phone', 'website', 'industry', 'address', 'city', 'state', 'country', 'logoUrl', 'notes'];
    fields.forEach((f) => { if (req.body[f] !== undefined) org[f] = req.body[f]; });
    await org.save();
    await recordAudit({ req, organizationId: org.id, action: 'ORGANIZATION_UPDATED', entityType: 'Organization', entityId: org.id });
    res.json(org);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update organization.', details: err.message });
  }
}

async function setStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED', 'INACTIVE', 'TRIAL'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    const org = await Organization.findByPk(req.params.id);
    if (!org) return res.status(404).json({ error: 'Organization not found.' });
    org.status = status;
    await org.save();
    await recordAudit({
      req, organizationId: org.id,
      action: status === 'SUSPENDED' ? 'ORGANIZATION_SUSPENDED' : 'ORGANIZATION_STATUS_CHANGED',
      entityType: 'Organization', entityId: org.id, metadata: { status },
    });
    res.json(org);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status.', details: err.message });
  }
}

async function listUsers(req, res) {
  try {
    const memberships = await OrganizationUser.findAll({
      where: { organizationId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'status'] }, { model: Role, as: 'role' }],
    });
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list organization users.', details: err.message });
  }
}

module.exports = { list, get, create, update, setStatus, listUsers };
