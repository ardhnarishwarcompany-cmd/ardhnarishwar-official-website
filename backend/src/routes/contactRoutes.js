const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contactController');
const { requireAdmin } = require('../middleware/auth');

// Public
router.post('/', ctrl.create);

// Admin only
router.get('/', requireAdmin, ctrl.list);
router.put('/:id/status', requireAdmin, ctrl.updateStatus);

module.exports = router;
