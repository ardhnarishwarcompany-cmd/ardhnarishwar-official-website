const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// Platform user (organization members: HR, Recruiter, Manager, Employee,
// Client, Sales User, org-level Admin). Deliberately separate from the
// existing `Admin` table, which continues to power the original CMS admin
// panel unchanged. A user's relationship to an organization + role lives
// in OrganizationUser (many-to-many), so the same person could belong to
// more than one organization later without a schema change.
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false },
  phone: { type: DataTypes.STRING(50), allowNull: true },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'),
    defaultValue: 'PENDING_VERIFICATION',
  },
  // Platform staff flag — bypasses organization membership checks and has
  // implicit access to every permission. This is the "Super Admin" role
  // from the spec, scoped to the new platform (not the legacy CMS Admin).
  isSuperAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },

  emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  // Registration verification is OTP-based (Register -> Verify -> Login),
  // matching the platform's User Journey Flow. The 6-digit code is hashed
  // the same way the old link-token was, so no extra columns were needed
  // for the hash/expiry itself — only otpAttempts + mobileVerified are new.
  emailVerifyTokenHash: { type: DataTypes.STRING(255), allowNull: true },
  emailVerifyTokenExpiresAt: { type: DataTypes.DATE, allowNull: true },
  otpAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  mobileVerified: { type: DataTypes.BOOLEAN, defaultValue: false },

  resetTokenHash: { type: DataTypes.STRING(255), allowNull: true },
  resetTokenExpiresAt: { type: DataTypes.DATE, allowNull: true },

  lastLoginAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'platform_users',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['status'] },
  ],
});

module.exports = User;
