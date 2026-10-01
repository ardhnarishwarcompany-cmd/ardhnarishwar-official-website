const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  assignedTo: { type: DataTypes.INTEGER, allowNull: true },
  dueDate: { type: DataTypes.DATE, allowNull: true },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    defaultValue: 'MEDIUM',
  },
  status: {
    type: DataTypes.ENUM('TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'TODO',
  },
  leadId: { type: DataTypes.INTEGER, allowNull: true },
  contactId: { type: DataTypes.INTEGER, allowNull: true },
  companyId: { type: DataTypes.INTEGER, allowNull: true },
  opportunityId: { type: DataTypes.INTEGER, allowNull: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'crm_tasks',
  timestamps: true,
  indexes: [
    { fields: ['organizationId'] },
    { fields: ['status'] },
    { fields: ['assignedTo'] },
    { fields: ['dueDate'] },
    { fields: ['priority'] },
  ],
});

module.exports = Task;
