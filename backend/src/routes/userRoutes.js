const express = require('express');
const router = express.Router();
const { requireUser, requireOrganization } = require('../middleware/platformAuth');
const { requirePermission } = require('../middleware/rbac');
const user = require('../controllers/userController');

// All routes here are org-scoped: pass ?organizationId=<id> (or
// x-organization-id header) unless the caller has exactly one membership.
router.use(requireUser, requireOrganization);

router.get('/', requirePermission('user', 'VIEW'), user.listMembers);
router.post('/invite', requirePermission('user', 'CREATE'), user.inviteUser);
router.patch('/:userId/role', requirePermission('user', 'MANAGE'), user.updateMemberRole);
router.patch('/:userId/status', requirePermission('user', 'MANAGE'), user.setMemberStatus);

module.exports = router;
