const express = require('express');
const router = express.Router();
const { requireUser, requireOrganization } = require('../middleware/platformAuth');
const sub = require('../controllers/subscriptionController');

function requireSuperAdmin(req, res, next) {
  if (!req.user?.isSuperAdmin) return res.status(403).json({ error: 'Super admin access required.' });
  next();
}

router.use(requireUser);

router.get('/plans', sub.listPlans);
router.post('/plans', requireSuperAdmin, sub.createPlan);
router.put('/plans/:id', requireSuperAdmin, sub.updatePlan);

router.get('/organization/:organizationId', requireOrganization, sub.getForOrganization);
router.post('/organization/:organizationId', requireSuperAdmin, sub.assignPlan);

module.exports = router;
