const express = require('express');
const router = express.Router();
const { requireUser } = require('../middleware/platformAuth');
const { listPermissions } = require('../controllers/roleController');

router.get('/', requireUser, listPermissions);

module.exports = router;
