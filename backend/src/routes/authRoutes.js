const express = require('express');
const router = express.Router();
const { login, me } = require('../controllers/authController');
const { requireAdmin } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', requireAdmin, me);

module.exports = router;
