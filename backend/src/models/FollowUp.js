const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FollowUp = sequelize.define('FollowUp', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
  dueDate: { type: DataTypes.DATE, allowNull: false },
  reminderAt: { type: DataTypes.DATE, allowNull: true },
  assignedTo: { type: DataTypes.INTEGER, allowNull: true },
  leadId: { type: DataTypes.INTEGER, allowNull: true },
  contactId: { type: DataTypes.INTEGER, allowNull: true },
  companyId: { type: DataTypes.INTEGER, allowNull: true },
  opportunityId: { type: DataTypes.INTEGER, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'overdue'),
    defaultValue: 'pending',
  },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'crm_followups',
  timestamps: true,
  indexes: [
    { fields: ['organizationId'] },
    { fields: ['dueDate'] },
    { fields: ['status'] },
    { fields: ['assignedTo'] },
  ],
});

module.exports = FollowUp;
