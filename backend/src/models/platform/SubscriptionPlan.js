const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(500), allowNull: true },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  billingCycle: {
    type: DataTypes.ENUM('MONTHLY', 'YEARLY', 'TRIAL'),
    defaultValue: 'MONTHLY',
  },
  features: { type: DataTypes.JSON, allowNull: true }, // e.g. ["crm","analytics"]
  limits: { type: DataTypes.JSON, allowNull: true },   // e.g. { maxUsers: 10, maxLeads: 5000 }
  status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), defaultValue: 'ACTIVE' },
}, {
  tableName: 'subscription_plans',
  timestamps: true,
});

module.exports = SubscriptionPlan;
