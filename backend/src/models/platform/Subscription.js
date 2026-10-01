const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// Payment gateway integration is intentionally NOT implemented (none existed
// in the project already) — this table is the architecture a real gateway's
// webhook handler would plug into later (see README note in this phase's
// summary for exactly where).
const Subscription = sequelize.define('Subscription', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  planId: { type: DataTypes.INTEGER, allowNull: false },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: true },
  status: {
    type: DataTypes.ENUM('TRIAL', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED'),
    defaultValue: 'TRIAL',
  },
  autoRenew: { type: DataTypes.BOOLEAN, defaultValue: false },
  usage: { type: DataTypes.JSON, allowNull: true }, // e.g. { users: 4, leads: 120 }
}, {
  tableName: 'subscriptions',
  timestamps: true,
  indexes: [{ fields: ['organizationId'] }, { fields: ['status'] }],
});

module.exports = Subscription;
