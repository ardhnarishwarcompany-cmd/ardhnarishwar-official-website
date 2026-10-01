const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mediaController');
const { requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin only — media library is for content management, not public browsing
router.get('/', requireAdmin, ctrl.list);
router.post('/', requireAdmin, upload.single('file'), ctrl.upload);
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
