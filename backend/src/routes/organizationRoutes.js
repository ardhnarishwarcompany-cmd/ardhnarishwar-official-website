const express = require('express');
const router = express.Router();
const { requireUser } = require('../middleware/platformAuth');
const org = require('../controllers/organizationController');

// Platform-wide organization management. Only super admins may list/create
// every organization or force a status change — everyday org-admin
// self-service (edit own org, invite users) goes through the org-scoped
// routes in userRoutes.js instead.
function requireSuperAdmin(req, res, next) {
  if (!req.user?.isSuperAdmin) return res.status(403).json({ error: 'Super admin access required.' });
  next();
}

router.use(requireUser);

router.get('/', requireSuperAdmin, org.list);
router.post('/', requireSuperAdmin, org.create);
router.get('/:id', org.get); // any authenticated user may view an org they belong to (checked in controller if needed)
router.put('/:id', requireSuperAdmin, org.update);
router.patch('/:id/status', requireSuperAdmin, org.setStatus);
router.get('/:id/users', requireSuperAdmin, org.listUsers);

module.exports = router;
