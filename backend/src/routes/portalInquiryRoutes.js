const express = require('express');
const router = express.Router();
const { requireUser, requireOrganization } = require('../middleware/platformAuth');
const inquiry = require('../controllers/portalInquiryController');

// Client (organization portal user) endpoints only — does not touch admin CRM routes/controllers.
router.post('/', requireUser, requireOrganization, inquiry.create);
router.get('/mine', requireUser, requireOrganization, inquiry.listMine);

module.exports = router;
