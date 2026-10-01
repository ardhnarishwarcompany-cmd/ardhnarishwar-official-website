const express = require('express');
const router = express.Router();
const { requireUser, requireOrganization } = require('../middleware/platformAuth');
const { requirePermission } = require('../middleware/rbac');
const audit = require('../controllers/auditLogController');

router.get('/', requireUser, requireOrganization, requirePermission('auditlog', 'VIEW'), audit.list);

module.exports = router;
