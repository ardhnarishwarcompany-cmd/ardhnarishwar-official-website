const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// Refresh tokens are stored hashed (never plaintext) so a DB leak alone
// can't be replayed. Rotation: every /refresh call revokes the token used
// and issues a new one (see platformAuthController.refresh).
const RefreshToken = sequelize.define('RefreshToken', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  tokenHash: { type: DataTypes.STRING(255), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
  revokedAt: { type: DataTypes.DATE, allowNull: true },
  replacedByTokenHash: { type: DataTypes.STRING(255), allowNull: true },
  createdByIp: { type: DataTypes.STRING(100), allowNull: true },
}, {
  tableName: 'refresh_tokens',
  timestamps: true,
  indexes: [{ fields: ['userId'] }, { fields: ['tokenHash'] }],
});

module.exports = RefreshToken;
