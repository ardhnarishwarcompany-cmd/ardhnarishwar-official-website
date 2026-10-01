const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: true },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  action: { type: DataTypes.STRING(100), allowNull: false }, // e.g. LEAD_CREATED
  entityType: { type: DataTypes.STRING(100), allowNull: true },
  entityId: { type: DataTypes.INTEGER, allowNull: true },
  metadata: { type: DataTypes.JSON, allowNull: true },
  ipAddress: { type: DataTypes.STRING(100), allowNull: true },
  userAgent: { type: DataTypes.STRING(500), allowNull: true },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['organizationId'] },
    { fields: ['userId'] },
    { fields: ['action'] },
    { fields: ['createdAt'] },
  ],
});

module.exports = AuditLog;
