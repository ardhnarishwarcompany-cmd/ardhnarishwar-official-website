const express = require('express');
const router = express.Router();
const { requireUser } = require('../middleware/platformAuth');
const role = require('../controllers/roleController');

function requireSuperAdmin(req, res, next) {
  if (!req.user?.isSuperAdmin) return res.status(403).json({ error: 'Super admin access required.' });
  next();
}

// Any authenticated platform user can fetch the role name catalog (for invites).
router.get('/catalog', requireUser, role.listRoleCatalog);

// Full role management remains super-admin only.
router.use(requireUser, requireSuperAdmin);

router.get('/', role.listRoles);
router.post('/', role.createRole);
router.put('/:id', role.updateRole);
router.delete('/:id', role.deleteRole);
router.put('/:id/permissions', role.setRolePermissions);

module.exports = router;
