const { RolePermission, Permission } = require('../models/platform/platformAssociations');

// requirePermission('lead', 'DELETE') — must run AFTER auth middleware that
// sets either req.user (platform) or req.admin (legacy CMS).
//
// Access rules:
// 1. Platform super admin → allow
// 2. Legacy CMS admin (req.admin) → allow (full CRM access on default org)
// 3. Platform org member → check RolePermission for resource/action (MANAGE counts as all)
// 4. Otherwise → 403
function requirePermission(resource, action) {
  return async function (req, res, next) {
    try {
      // Platform super admin
      if (req.user?.isSuperAdmin) return next();

      // Legacy CMS admin JWT — keep existing /admin/crm fully functional
      if (req.admin && !req.user) return next();

      if (!req.membership) {
        return res.status(403).json({ error: 'Organization membership required.' });
      }

      const grants = await RolePermission.findAll({ where: { roleId: req.membership.roleId } });
      const permissionIds = grants.map((g) => g.permissionId);
      if (permissionIds.length === 0) {
        return res.status(403).json({ error: `Missing permission: ${resource}.${action}` });
      }
      const permissions = await Permission.findAll({ where: { id: permissionIds } });

      const allowed = permissions.some((p) => (
        p.resource === resource && (p.action === action || p.action === 'MANAGE')
      ));

      if (!allowed) {
        return res.status(403).json({ error: `Missing permission: ${resource}.${action}` });
      }
      next();
    } catch (err) {
      res.status(500).json({ error: 'Permission check failed.', details: err.message });
    }
  };
}

module.exports = { requirePermission };
