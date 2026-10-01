const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/blogController');
const { requireAdmin } = require('../middleware/auth');

// Public
router.get('/', ctrl.list);
router.get('/:slug', ctrl.getBySlug);

// Admin only
router.post('/', requireAdmin, ctrl.create);
router.put('/:id', requireAdmin, ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
