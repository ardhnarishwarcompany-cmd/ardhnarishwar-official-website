const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/jobController');
const { requireAdmin } = require('../middleware/auth');

router.get('/', ctrl.list); // public
router.get('/:slug', ctrl.getBySlug); // public

router.post('/', requireAdmin, ctrl.create);
router.put('/:id', requireAdmin, ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
