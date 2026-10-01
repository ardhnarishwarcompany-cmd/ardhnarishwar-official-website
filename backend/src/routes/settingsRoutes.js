const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settingsController');
const { requireAdmin } = require('../middleware/auth');

// Public — read platform links, contact info, social links
router.get('/', ctrl.get);

// Admin only — edit them
router.put('/', requireAdmin, ctrl.update);

module.exports = router;
