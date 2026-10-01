const express = require('express');
const router = express.Router();
const { requireUser } = require('../middleware/platformAuth');
const notif = require('../controllers/notificationController');

router.use(requireUser);

router.get('/', notif.list);
router.patch('/:id/read', notif.markRead);
router.patch('/read-all', notif.markAllRead);

module.exports = router;
