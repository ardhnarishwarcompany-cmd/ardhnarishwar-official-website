const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// Candidate (job-seeker) account — deliberately separate from the platform
// `User` table (which is for organizations subscribing to the CRM/HRMS).
// A candidate has no organization membership; they just register, verify
// via OTP, log in, and explore services / (later) jobs & applications.
// Same OTP-based Register -> Verify -> Login journey as the org portal.
const Candidate = sequelize.define('Candidate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false },
  phone: { type: DataTypes.STRING(50), allowNull: true },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'),
    defaultValue: 'PENDING_VERIFICATION',
  },

  emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  emailVerifyTokenHash: { type: DataTypes.STRING(255), allowNull: true },
  emailVerifyTokenExpiresAt: { type: DataTypes.DATE, allowNull: true },
  otpAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  mobileVerified: { type: DataTypes.BOOLEAN, defaultValue: false },

  resetTokenHash: { type: DataTypes.STRING(255), allowNull: true },
  resetTokenExpiresAt: { type: DataTypes.DATE, allowNull: true },

  lastLoginAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'candidates',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['status'] },
  ],
});

module.exports = Candidate;
