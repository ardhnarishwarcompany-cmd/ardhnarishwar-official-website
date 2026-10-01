const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// Mirrors the org-portal RefreshToken model, scoped to candidates instead.
// Stored hashed; rotated on every /refresh call.
const CandidateRefreshToken = sequelize.define('CandidateRefreshToken', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  candidateId: { type: DataTypes.INTEGER, allowNull: false },
  tokenHash: { type: DataTypes.STRING(255), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
  revokedAt: { type: DataTypes.DATE, allowNull: true },
  replacedByTokenHash: { type: DataTypes.STRING(255), allowNull: true },
  createdByIp: { type: DataTypes.STRING(100), allowNull: true },
}, {
  tableName: 'candidate_refresh_tokens',
  timestamps: true,
  indexes: [{ fields: ['candidateId'] }, { fields: ['tokenHash'] }],
});

module.exports = CandidateRefreshToken;
