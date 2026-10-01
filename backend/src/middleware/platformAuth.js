const jwt = require('jsonwebtoken');
const { User, OrganizationUser } = require('../models/platform/platformAssociations');

// Protects platform (organization-user) routes. Separate from the legacy
// requireAdmin (middleware/auth.js), which continues to guard the original
// CMS admin panel untouched.
async function requireUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token provided.' });

  try {
    const payload = jwt.verify(token, process.env.PLATFORM_JWT_SECRET || process.env.JWT_SECRET);
    if (payload.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type.' });
    }
    const user = await User.findByPk(payload.id);
    if (!user || user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      return res.status(401).json({ error: 'Account is not active.' });
    }
    req.user = { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// Resolves req.organizationId + req.membership for the org referenced by
// :organizationId in the URL, OR (for CRM-style routes with no org in the
// URL) the user's sole/first ACTIVE membership. Blocks the request outright
// if the user has no active membership in that org and isn't a super admin.
// This is the backend-level tenant check the spec requires — never rely on
// the frontend alone to hide another org's data.
async function requireOrganization(req, res, next) {
  try {
    if (req.user?.isSuperAdmin) {
      req.organizationId = req.params.organizationId ? Number(req.params.organizationId) : (req.query.organizationId ? Number(req.query.organizationId) : null);
      return next();
    }

    const requestedOrgId = req.params.organizationId || req.query.organizationId || req.headers['x-organization-id'];

    const where = { userId: req.user.id, status: 'ACTIVE' };
    if (requestedOrgId) where.organizationId = Number(requestedOrgId);

    const membership = await OrganizationUser.findOne({ where, include: [{ association: 'role' }, { association: 'organization' }] });

    if (!membership) {
      return res.status(403).json({ error: 'No active membership for this organization.' });
    }
    if (membership.organization.status === 'SUSPENDED' || membership.organization.status === 'INACTIVE') {
      return res.status(403).json({ error: 'This organization is not active.' });
    }

    req.organizationId = membership.organizationId;
    req.membership = membership; // .role available for RBAC middleware
    next();
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve organization context.', details: err.message });
  }
}

module.exports = { requireUser, requireOrganization };
