const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: true },
  userId: { type: DataTypes.INTEGER, allowNull: false }, // recipient
  type: { type: DataTypes.STRING(100), allowNull: false }, // e.g. LEAD_ASSIGNED
  title: { type: DataTypes.STRING(255), allowNull: false },
  message: { type: DataTypes.STRING(1000), allowNull: true },
  relatedEntityType: { type: DataTypes.STRING(100), allowNull: true },
  relatedEntityId: { type: DataTypes.INTEGER, allowNull: true },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [{ fields: ['userId'] }, { fields: ['isRead'] }, { fields: ['organizationId'] }],
});

module.exports = Notification;
