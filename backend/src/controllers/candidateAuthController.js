const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Candidate, CandidateRefreshToken } = require('../models/candidate/candidateAssociations');
const { sendOtpEmail } = require('../utils/mailer');

const ACCESS_EXPIRES_IN = process.env.CANDIDATE_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_DAYS = Number(process.env.CANDIDATE_REFRESH_EXPIRES_DAYS || 30);
const OTP_EXPIRES_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

async function issueOtp(candidate, purpose) {
  const otp = generateOtp();
  candidate.emailVerifyTokenHash = hashToken(otp);
  candidate.emailVerifyTokenExpiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
  candidate.otpAttempts = 0;
  await candidate.save();
  console.log(`[candidate-otp-${purpose}] ${candidate.email}${candidate.phone ? ' / ' + candidate.phone : ''}: OTP is ${otp} (expires in ${OTP_EXPIRES_MINUTES} min)`);
  await sendOtpEmail({ to: candidate.email, name: candidate.name, otp, purpose });
  return otp;
}

function signAccessToken(candidate) {
  return jwt.sign(
    { id: candidate.id, email: candidate.email, type: 'candidate_access' },
    process.env.CANDIDATE_JWT_SECRET || process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

async function issueRefreshToken(candidate, req) {
  const raw = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await CandidateRefreshToken.create({
    candidateId: candidate.id,
    tokenHash: hashToken(raw),
    expiresAt,
    createdByIp: req.ip,
  });
  return raw;
}

function publicCandidate(candidate) {
  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    emailVerified: candidate.emailVerified,
    mobileVerified: candidate.mobileVerified,
    status: candidate.status,
    lastLoginAt: candidate.lastLoginAt,
    createdAt: candidate.createdAt,
  };
}

// ---------------------------------------------------------------- register
async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const existing = await Candidate.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, 10);

    const candidate = await Candidate.create({
      name,
      email,
      phone: phone || null,
      passwordHash,
      status: 'PENDING_VERIFICATION',
    });

    // Step 2 of the journey (Register -> Verify -> Login): issue an OTP
    // instead of logging the candidate in directly.
    await issueOtp(candidate, 'register');

    res.status(201).json({
      message: 'Account created. Enter the OTP sent to your email/mobile to verify your account before logging in.',
      requiresVerification: true,
      email: candidate.email,
      candidate: publicCandidate(candidate),
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.', details: err.message });
  }
}

// ------------------------------------------------------------------ login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const candidate = await Candidate.findOne({ where: { email } });
    if (!candidate) return res.status(401).json({ error: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, candidate.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    if (candidate.status === 'SUSPENDED' || candidate.status === 'INACTIVE') {
      return res.status(403).json({ error: 'This account has been deactivated.' });
    }
    if (candidate.status === 'PENDING_VERIFICATION' || !candidate.emailVerified) {
      return res.status(403).json({
        error: 'Please verify your account with the OTP sent to your email/mobile before logging in.',
        requiresVerification: true,
        email: candidate.email,
      });
    }

    candidate.lastLoginAt = new Date();
    await candidate.save();

    const accessToken = signAccessToken(candidate);
    const refreshToken = await issueRefreshToken(candidate, req);

    res.json({
      accessToken,
      refreshToken,
      candidate: publicCandidate(candidate),
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.', details: err.message });
  }
}

// ------------------------------------------------------------------ logout
async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await CandidateRefreshToken.update(
        { revoked: true, revokedAt: new Date() },
        { where: { tokenHash: hashToken(refreshToken) } }
      );
    }
    res.json({ message: 'Logged out.' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed.', details: err.message });
  }
}

// --------------------------------------------------------------- refresh
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required.' });

    const tokenHash = hashToken(refreshToken);
    const record = await CandidateRefreshToken.findOne({ where: { tokenHash } });

    if (!record || record.revoked || record.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    const candidate = await Candidate.findByPk(record.candidateId);
    if (!candidate || candidate.status === 'SUSPENDED' || candidate.status === 'INACTIVE') {
      return res.status(401).json({ error: 'Account is not active.' });
    }

    const newRefreshRaw = await issueRefreshToken(candidate, req);
    record.revoked = true;
    record.revokedAt = new Date();
    record.replacedByTokenHash = hashToken(newRefreshRaw);
    await record.save();

    const accessToken = signAccessToken(candidate);
    res.json({ accessToken, refreshToken: newRefreshRaw });
  } catch (err) {
    res.status(500).json({ error: 'Token refresh failed.', details: err.message });
  }
}

// --------------------------------------------------------- forgot / reset
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const genericResponse = { message: 'If an account exists for that email, a reset link has been sent.' };
    if (!email) return res.json(genericResponse);

    const candidate = await Candidate.findOne({ where: { email } });
    if (!candidate) return res.json(genericResponse);

    const raw = crypto.randomBytes(32).toString('hex');
    candidate.resetTokenHash = hashToken(raw);
    candidate.resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await candidate.save();

    console.log(`[candidate-password-reset] ${email}: /reset-password?token=${raw}`);
    res.json(genericResponse);
  } catch (err) {
    res.status(500).json({ error: 'Request failed.', details: err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'token and newPassword are required.' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const candidate = await Candidate.findOne({ where: { resetTokenHash: hashToken(token) } });
    if (!candidate || !candidate.resetTokenExpiresAt || candidate.resetTokenExpiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    candidate.passwordHash = await bcrypt.hash(newPassword, 10);
    candidate.resetTokenHash = null;
    candidate.resetTokenExpiresAt = null;
    await candidate.save();

    await CandidateRefreshToken.update({ revoked: true, revokedAt: new Date() }, { where: { candidateId: candidate.id, revoked: false } });

    res.json({ message: 'Password updated. Please log in again.' });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed.', details: err.message });
  }
}

// ------------------------------------------------------- verify OTP (email/mobile)
async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'email and otp are required.' });

    const candidate = await Candidate.findOne({ where: { email } });
    if (!candidate) return res.status(400).json({ error: 'Invalid or expired OTP.' });

    if (candidate.emailVerified && candidate.status !== 'PENDING_VERIFICATION') {
      return res.json({ message: 'Account already verified. You can log in.' });
    }

    if (!candidate.emailVerifyTokenHash || !candidate.emailVerifyTokenExpiresAt || candidate.emailVerifyTokenExpiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (candidate.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    if (hashToken(String(otp)) !== candidate.emailVerifyTokenHash) {
      candidate.otpAttempts += 1;
      await candidate.save();
      return res.status(400).json({ error: 'Incorrect OTP.', attemptsRemaining: Math.max(0, OTP_MAX_ATTEMPTS - candidate.otpAttempts) });
    }

    candidate.emailVerified = true;
    if (candidate.phone) candidate.mobileVerified = true;
    candidate.status = 'ACTIVE';
    candidate.emailVerifyTokenHash = null;
    candidate.emailVerifyTokenExpiresAt = null;
    candidate.otpAttempts = 0;
    await candidate.save();

    res.json({ message: 'Verified successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed.', details: err.message });
  }
}

async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    const genericResponse = { message: 'If an account is pending verification for that email, a new OTP has been sent.' };
    if (!email) return res.json(genericResponse);

    const candidate = await Candidate.findOne({ where: { email } });
    if (!candidate || candidate.status !== 'PENDING_VERIFICATION') return res.json(genericResponse);

    await issueOtp(candidate, 'resend');
    res.json(genericResponse);
  } catch (err) {
    res.status(500).json({ error: 'Could not resend OTP.', details: err.message });
  }
}

// ----------------------------------------------------------------------- me
async function me(req, res) {
  try {
    const candidate = await Candidate.findByPk(req.candidate.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found.' });

    // Services this candidate account can launch (accessType candidate or both).
    // Candidates are on a free "Candidate Access" plan — no paid subscription row.
    const { Op } = require('sequelize');
    const Service = require('../models/Service');
    const services = await Service.findAll({
      where: {
        isPublished: true,
        accessType: { [Op.in]: ['candidate', 'both', 'public'] },
      },
      attributes: ['id', 'title', 'slug', 'category', 'shortDescription', 'accessType', 'externalUrl', 'imageUrl'],
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
    });

    res.json({
      ...publicCandidate(candidate),
      plan: {
        name: 'Candidate Access',
        type: 'FREE',
        description: 'Free access for job seekers to explore and launch candidate-facing services.',
        status: candidate.status === 'ACTIVE' ? 'ACTIVE' : candidate.status,
      },
      accessibleServices: services,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not load profile.', details: err.message });
  }
}


// ----------------------------------------------------- subscription upgrade
// Candidates sit on a free "Candidate Access" entitlement. Upgrading is a
// request to sales (same lead pipeline as org portal plan requests) — no
// payment gateway is wired. Staff then assign a paid org plan or custom deal.
async function listUpgradePlans(req, res) {
  try {
    const { SubscriptionPlan } = require('../models/platform/platformAssociations');
    const plans = await SubscriptionPlan.findAll({
      where: { status: 'ACTIVE' },
      order: [['price', 'ASC']],
    });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list plans.', details: err.message });
  }
}

async function requestPlanUpgrade(req, res) {
  try {
    const { planId, message } = req.body;
    if (!planId) return res.status(400).json({ error: 'planId is required.' });

    const { SubscriptionPlan } = require('../models/platform/platformAssociations');
    const Lead = require('../models/Lead');
    const { computeLeadScore } = require('../utils/leadScoring');

    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan || plan.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'Plan not found or inactive.' });
    }

    const candidate = await Candidate.findByPk(req.candidate.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found.' });

    const ADMIN_ORG_ID = 1;
    const source = 'candidate_plan_request';
    const meta = {
      type: 'PLAN_CHANGE_REQUEST',
      planId: plan.id,
      planName: plan.name,
      requesterType: 'candidate',
      candidateId: candidate.id,
    };

    // Dedupe pending requests for the same plan from the same email
    const { Op } = require('sequelize');
    const existing = await Lead.findOne({
      where: {
        email: candidate.email,
        source,
        organizationId: ADMIN_ORG_ID,
        status: { [Op.in]: ['NEW', 'CONTACTED', 'QUALIFIED'] },
      },
    });
    if (existing) {
      try {
        const existingMeta = JSON.parse(existing.notes || '{}');
        if (existingMeta.planId === plan.id) {
          return res.status(409).json({
            error: 'You already have a pending upgrade request for this plan.',
            lead: { id: existing.id, status: existing.status },
          });
        }
      } catch (_) { /* create new */ }
    }

    const requirement = `[CANDIDATE PLAN UPGRADE] ${candidate.name} (${candidate.email}) requests ${plan.name}` +
      (message ? ` — ${message}` : '');

    const { score, grade } = computeLeadScore({
      email: candidate.email,
      phone: candidate.phone,
      company: null,
      requirement,
      source,
      priority: 'MEDIUM',
    });

    const lead = await Lead.create({
      name: candidate.name || 'Candidate upgrade',
      email: candidate.email,
      phone: candidate.phone || null,
      company: null,
      requirement,
      notes: JSON.stringify(meta),
      source,
      status: 'NEW',
      priority: 'MEDIUM',
      organizationId: ADMIN_ORG_ID,
      aiScore: score,
      aiGrade: grade,
    });

    res.status(201).json({
      success: true,
      message: `Upgrade request for ${plan.name} submitted. Our team will contact you.`,
      request: {
        id: lead.id,
        planId: plan.id,
        planName: plan.name,
        status: lead.status,
        createdAt: lead.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit upgrade request.', details: err.message });
  }
}

async function listMyPlanRequests(req, res) {
  try {
    const Lead = require('../models/Lead');
    const candidate = await Candidate.findByPk(req.candidate.id);
    if (!candidate?.email) return res.json([]);

    const ADMIN_ORG_ID = 1;
    const leads = await Lead.findAll({
      where: {
        email: candidate.email,
        source: 'candidate_plan_request',
        organizationId: ADMIN_ORG_ID,
      },
      order: [['createdAt', 'DESC']],
    });

    res.json(leads.map((l) => {
      let meta = {};
      try { meta = JSON.parse(l.notes || '{}'); } catch (_) {}
      return {
        id: l.id,
        type: 'PLAN_CHANGE_REQUEST',
        planId: meta.planId || null,
        planName: meta.planName || null,
        requirement: l.requirement,
        status: l.status,
        createdAt: l.createdAt,
      };
    }));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load upgrade requests.', details: err.message });
  }
}

module.exports = {
  register, login, logout, refresh, forgotPassword, resetPassword, verifyEmail, resendOtp, me,
  listUpgradePlans, requestPlanUpgrade, listMyPlanRequests,
};

