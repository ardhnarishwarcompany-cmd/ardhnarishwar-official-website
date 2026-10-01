const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, RefreshToken, Organization, OrganizationUser, Role, SubscriptionPlan, Subscription } = require('../models/platform/platformAssociations');
const { recordAudit } = require('../utils/audit');
const { sendOtpEmail } = require('../utils/mailer');

const ACCESS_EXPIRES_IN = process.env.PLATFORM_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_DAYS = Number(process.env.PLATFORM_REFRESH_EXPIRES_DAYS || 30);

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// 6-digit numeric OTP — used for the Register -> Verify -> Login step.
// Reuses the emailVerifyTokenHash/ExpiresAt columns (same hashing scheme,
// just a short code instead of a long link token), so no schema change was
// needed for the code itself.
const OTP_EXPIRES_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

async function issueOtp(user, purpose) {
  const otp = generateOtp();
  user.emailVerifyTokenHash = hashToken(otp);
  user.emailVerifyTokenExpiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
  user.otpAttempts = 0;
  await user.save();
  // Always logged server-side too — handy for local dev even when SMTP is
  // configured, and the only way to see the OTP when it isn't.
  console.log(`[otp-${purpose}] ${user.email}${user.phone ? ' / ' + user.phone : ''}: OTP is ${otp} (expires in ${OTP_EXPIRES_MINUTES} min)`);
  await sendOtpEmail({ to: user.email, name: user.name, otp, purpose });
  return otp;
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, type: 'access' },
    process.env.PLATFORM_JWT_SECRET || process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

async function issueRefreshToken(user, req) {
  const raw = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    userId: user.id,
    tokenHash: hashToken(raw),
    expiresAt,
    createdByIp: req.ip,
  });
  return raw;
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, isSuperAdmin: user.isSuperAdmin, emailVerified: user.emailVerified, status: user.status };
}

// ---------------------------------------------------------------- register
// Self-serve registration creates the User AND a brand-new Organization
// with that user as its owner/ADMIN — this is the "sign up your company"
// flow. Inviting additional users into an *existing* org is handled by
// userController.inviteUser instead.
async function register(req, res) {
  try {
    const { name, email, password, organizationName, phone } = req.body;
    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({ error: 'name, email, password and organizationName are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone: phone || null,
      passwordHash,
      status: 'PENDING_VERIFICATION',
    });

    const slugBase = organizationName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = slugBase || `org-${user.id}`;
    let suffix = 1;
    while (await Organization.findOne({ where: { slug } })) {
      slug = `${slugBase}-${suffix++}`;
    }

    const org = await Organization.create({ name: organizationName, slug, status: 'TRIAL', createdBy: user.id });
    const adminRole = await Role.findOne({ where: { name: 'ADMIN' } });
    await OrganizationUser.create({ organizationId: org.id, userId: user.id, roleId: adminRole.id, status: 'ACTIVE', isOwner: true });

    // Trial subscription + enable core modules so the client journey is complete on day one
    const trialPlan = await SubscriptionPlan.findOne({ where: { billingCycle: 'TRIAL' } })
      || await SubscriptionPlan.findOne({ order: [['price', 'ASC']] });
    if (trialPlan) {
      await Subscription.create({
        organizationId: org.id,
        planId: trialPlan.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'TRIAL',
        autoRenew: false,
      });
    }

    await recordAudit({ req, organizationId: org.id, userId: user.id, action: 'ORGANIZATION_CREATED', entityType: 'Organization', entityId: org.id });

    // Step 2 of the journey (Register -> Verify -> Login): issue an OTP
    // instead of logging the user in directly.
    await issueOtp(user, 'register');

    res.status(201).json({
      message: 'Account created. Enter the OTP sent to your email/mobile to verify your account before logging in.',
      requiresVerification: true,
      email: user.email,
      user: publicUser(user),
      organization: { id: org.id, name: org.name, slug: org.slug, status: org.status },
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

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      return res.status(403).json({ error: 'This account has been deactivated.' });
    }
    // Step 2 (Verify) is mandatory before step 3 (Login) in the platform's
    // Register -> Verify -> Login journey.
    if (user.status === 'PENDING_VERIFICATION' || !user.emailVerified) {
      return res.status(403).json({
        error: 'Please verify your account with the OTP sent to your email/mobile before logging in.',
        requiresVerification: true,
        email: user.email,
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = signAccessToken(user);
    const refreshToken = await issueRefreshToken(user, req);

    const memberships = await OrganizationUser.findAll({
      where: { userId: user.id, status: 'ACTIVE' },
      include: [{ model: Organization, as: 'organization' }, { model: Role, as: 'role' }],
    });

    await recordAudit({ req, userId: user.id, action: 'USER_LOGIN' });

    const primary = memberships[0];
    res.json({
      accessToken,
      refreshToken,
      user: {
        ...publicUser(user),
        organizationId: primary?.organizationId || null,
        organizations: memberships.map((m) => ({
          id: m.organizationId,
          name: m.organization?.name,
          slug: m.organization?.slug,
          role: m.role?.name,
          isOwner: m.isOwner,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.', details: err.message });
  }
}

// ------------------------------------------------------------------ logout
// Revokes the specific refresh token so it can't be used again; the access
// token remains valid until it naturally expires (short-lived by design).
async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.update(
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
    const record = await RefreshToken.findOne({ where: { tokenHash } });

    if (!record || record.revoked || record.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    const user = await User.findByPk(record.userId);
    if (!user || user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      return res.status(401).json({ error: 'Account is not active.' });
    }

    // Rotation: revoke the used token, issue a brand new pair.
    const newRefreshRaw = await issueRefreshToken(user, req);
    record.revoked = true;
    record.revokedAt = new Date();
    record.replacedByTokenHash = hashToken(newRefreshRaw);
    await record.save();

    const accessToken = signAccessToken(user);
    res.json({ accessToken, refreshToken: newRefreshRaw });
  } catch (err) {
    res.status(500).json({ error: 'Token refresh failed.', details: err.message });
  }
}

// --------------------------------------------------------- forgot / reset
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    // Always return the same message whether or not the email exists, so
    // this endpoint can't be used to enumerate registered accounts.
    const genericResponse = { message: 'If an account exists for that email, a reset link has been sent.' };
    if (!email) return res.json(genericResponse);

    const user = await User.findOne({ where: { email } });
    if (!user) return res.json(genericResponse);

    const raw = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = hashToken(raw);
    user.resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    console.log(`[password-reset] ${email}: /reset-password?token=${raw}`);
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

    const user = await User.findOne({ where: { resetTokenHash: hashToken(token) } });
    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    await user.save();

    // Revoke all existing refresh tokens on password change.
    await RefreshToken.update({ revoked: true, revokedAt: new Date() }, { where: { userId: user.id, revoked: false } });
    await recordAudit({ req, userId: user.id, action: 'USER_PASSWORD_RESET' });

    res.json({ message: 'Password updated. Please log in again.' });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed.', details: err.message });
  }
}

// ------------------------------------------------------- verify OTP (email/mobile)
// Step 2 of the journey: Register -> Verify -> Login. A single OTP verifies
// both channels at once (email is required at signup; mobile is optional).
async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'email and otp are required.' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired OTP.' });

    if (user.emailVerified && user.status !== 'PENDING_VERIFICATION') {
      return res.json({ message: 'Account already verified. You can log in.' });
    }

    if (!user.emailVerifyTokenHash || !user.emailVerifyTokenExpiresAt || user.emailVerifyTokenExpiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    if (hashToken(String(otp)) !== user.emailVerifyTokenHash) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ error: 'Incorrect OTP.', attemptsRemaining: Math.max(0, OTP_MAX_ATTEMPTS - user.otpAttempts) });
    }

    user.emailVerified = true;
    if (user.phone) user.mobileVerified = true;
    user.status = 'ACTIVE';
    user.emailVerifyTokenHash = null;
    user.emailVerifyTokenExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    res.json({ message: 'Verified successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed.', details: err.message });
  }
}

// Resend a fresh OTP (old one is invalidated). Rate-limited at the route level.
async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    const genericResponse = { message: 'If an account is pending verification for that email, a new OTP has been sent.' };
    if (!email) return res.json(genericResponse);

    const user = await User.findOne({ where: { email } });
    if (!user || user.status !== 'PENDING_VERIFICATION') return res.json(genericResponse);

    await issueOtp(user, 'resend');
    res.json(genericResponse);
  } catch (err) {
    res.status(500).json({ error: 'Could not resend OTP.', details: err.message });
  }
}

// ----------------------------------------------------------------------- me
async function me(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ association: 'organizations', through: { attributes: ['roleId', 'status', 'isOwner'] } }],
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Primary org membership + current subscription plan (trial or paid)
    const membership = await OrganizationUser.findOne({
      where: { userId: user.id, status: 'ACTIVE' },
      include: [{ association: 'organization' }, { association: 'role' }],
      order: [['createdAt', 'ASC']],
    });

    let plan = {
      name: 'No plan',
      type: 'NONE',
      description: 'No active organization subscription found.',
      status: 'INACTIVE',
      billingCycle: null,
      price: null,
    };
    let organization = null;

    if (membership?.organization) {
      const org = membership.organization;
      organization = {
        id: org.id,
        name: org.name,
        slug: org.slug,
        status: org.status,
        role: membership.role?.name || null,
        isOwner: Boolean(membership.isOwner),
      };

      const sub = await Subscription.findOne({
        where: { organizationId: org.id },
        include: [{ association: 'plan' }],
        order: [['createdAt', 'DESC']],
      });

      if (sub?.plan) {
        const p = sub.plan;
        plan = {
          name: p.name,
          type: Number(p.price) > 0 ? 'PAID' : (p.billingCycle === 'TRIAL' ? 'TRIAL' : 'FREE'),
          description: p.description || null,
          status: sub.status || 'ACTIVE',
          billingCycle: p.billingCycle,
          price: p.price,
          subscriptionId: sub.id,
          startDate: sub.startDate,
          endDate: sub.endDate,
        };
      } else if (org.status === 'TRIAL') {
        plan = {
          name: 'Trial',
          type: 'TRIAL',
          description: 'Trial workspace for your organization. Upgrade anytime for full commercial terms.',
          status: 'ACTIVE',
          billingCycle: 'TRIAL',
          price: 0,
        };
      }
    }

    // Org/client services (organization + both + public)
    const { Op } = require('sequelize');
    const Service = require('../models/Service');
    const services = await Service.findAll({
      where: {
        isPublished: true,
        accessType: { [Op.in]: ['organization', 'both', 'public'] },
      },
      attributes: ['id', 'title', 'slug', 'category', 'shortDescription', 'accessType', 'externalUrl', 'imageUrl'],
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
    });

    res.json({
      ...publicUser(user),
      phone: user.phone || null,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || null,
      organization,
      plan,
      accessibleServices: services,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not load profile.', details: err.message });
  }
}

// ----------------------------------------------------- subscription upgrade
// Org clients start on Trial (or free). Upgrading is a sales request lead —
// no payment gateway. Staff assign a paid plan via admin after contact.
async function listUpgradePlans(req, res) {
  try {
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

    const Lead = require('../models/Lead');
    const { computeLeadScore } = require('../utils/leadScoring');

    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan || plan.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'Plan not found or inactive.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const membership = await OrganizationUser.findOne({
      where: { userId: user.id, status: 'ACTIVE' },
      include: [{ association: 'organization' }],
      order: [['createdAt', 'ASC']],
    });
    const org = membership?.organization || null;

    const ADMIN_ORG_ID = 1;
    const source = 'org_plan_request';
    const meta = {
      type: 'PLAN_CHANGE_REQUEST',
      planId: plan.id,
      planName: plan.name,
      requesterType: 'organization',
      userId: user.id,
      organizationId: org?.id || null,
      organizationName: org?.name || null,
    };

    const { Op } = require('sequelize');
    const existing = await Lead.findOne({
      where: {
        email: user.email,
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

    const orgLabel = org ? `${org.name} (org #${org.id})` : 'no organization';
    const requirement = `[ORG PLAN UPGRADE] ${user.name} (${user.email}) — ${orgLabel} requests ${plan.name}` +
      (message ? ` — ${message}` : '');

    const { score, grade } = computeLeadScore({
      email: user.email,
      phone: user.phone,
      company: org?.name || null,
      requirement,
      source,
      priority: 'MEDIUM',
    });

    const lead = await Lead.create({
      name: user.name || 'Org upgrade',
      email: user.email,
      phone: user.phone || null,
      company: org?.name || null,
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
    const user = await User.findByPk(req.user.id);
    if (!user?.email) return res.json([]);

    const ADMIN_ORG_ID = 1;
    const leads = await Lead.findAll({
      where: {
        email: user.email,
        source: 'org_plan_request',
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
