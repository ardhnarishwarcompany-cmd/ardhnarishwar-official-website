const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Activity = sequelize.define('Activity', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: true },
  type: {
    type: DataTypes.ENUM('Call', 'Email', 'Meeting', 'Note', 'Demo', 'Other'),
    defaultValue: 'Note',
  },
  subject: { type: DataTypes.STRING(255), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  leadId: { type: DataTypes.INTEGER, allowNull: true },
  contactId: { type: DataTypes.INTEGER, allowNull: true },
  companyId: { type: DataTypes.INTEGER, allowNull: true },
  opportunityId: { type: DataTypes.INTEGER, allowNull: true },
  assignedTo: { type: DataTypes.INTEGER, allowNull: true },
  activityDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  status: {
    type: DataTypes.ENUM('planned', 'completed', 'cancelled'),
    defaultValue: 'completed',
  },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'crm_activities',
  timestamps: true,
  indexes: [
    { fields: ['organizationId'] },
    { fields: ['leadId'] },
    { fields: ['contactId'] },
    { fields: ['companyId'] },
    { fields: ['opportunityId'] },
    { fields: ['activityDate'] },
  ],
});

module.exports = Activity;
