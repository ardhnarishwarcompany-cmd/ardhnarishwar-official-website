const express = require('express');
const router = express.Router();
const auth = require('../controllers/candidateAuthController');
const { requireCandidate } = require('../middleware/candidateAuth');
const { rateLimit } = require('../middleware/rateLimit');

router.post('/register', rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), auth.register);
router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 15 }), auth.login);
router.post('/logout', auth.logout);
router.post('/refresh-token', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }), auth.refresh);
router.post('/forgot-password', rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), auth.forgotPassword);
router.post('/reset-password', rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), auth.resetPassword);
router.post('/verify-email', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }), auth.verifyEmail);
router.post('/resend-otp', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), auth.resendOtp);
router.get('/me', requireCandidate, auth.me);

// Subscription upgrade (request-based; no payment gateway)
router.get('/plans', requireCandidate, auth.listUpgradePlans);
router.post('/plan-request', rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), requireCandidate, auth.requestPlanUpgrade);
router.get('/plan-requests', requireCandidate, auth.listMyPlanRequests);

module.exports = router;
