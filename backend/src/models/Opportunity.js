const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Opportunity = sequelize.define('Opportunity', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  companyId: { type: DataTypes.INTEGER, allowNull: true },
  contactId: { type: DataTypes.INTEGER, allowNull: true },
  leadId: { type: DataTypes.INTEGER, allowNull: true },
  ownerId: { type: DataTypes.INTEGER, allowNull: true },
  expectedValue: { type: DataTypes.DECIMAL(15, 2), allowNull: true, defaultValue: 0 },
  probability: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
  expectedCloseDate: { type: DataTypes.DATEONLY, allowNull: true },
  stage: {
    type: DataTypes.ENUM(
      'NEW',
      'QUALIFIED',
      'PROPOSAL',
      'NEGOTIATION',
      'WON',
      'LOST'
    ),
    defaultValue: 'NEW',
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'WON', 'LOST'),
    defaultValue: 'OPEN',
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'crm_opportunities',
  timestamps: true,
  indexes: [
    { fields: ['organizationId'] },
    { fields: ['stage'] },
    { fields: ['status'] },
    { fields: ['ownerId'] },
    { fields: ['companyId'] },
    { fields: ['expectedCloseDate'] },
  ],
});

module.exports = Opportunity;
