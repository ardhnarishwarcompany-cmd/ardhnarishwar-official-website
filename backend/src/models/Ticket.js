const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ticket = sequelize.define('Ticket', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: true },
  ticketNumber: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  subject: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  customerName: { type: DataTypes.STRING(255), allowNull: true },
  customerEmail: { type: DataTypes.STRING(255), allowNull: true },
  contactId: { type: DataTypes.INTEGER, allowNull: true },
  companyId: { type: DataTypes.INTEGER, allowNull: true },
  assignedTo: { type: DataTypes.INTEGER, allowNull: true },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    defaultValue: 'MEDIUM',
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'),
    defaultValue: 'OPEN',
  },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'crm_tickets',
  timestamps: true,
  indexes: [
    { fields: ['organizationId'] },
    { fields: ['ticketNumber'], unique: true },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['assignedTo'] },
  ],
});

module.exports = Ticket;
