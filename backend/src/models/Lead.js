const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Lead = sequelize.define('Lead', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  company: { type: DataTypes.STRING(255), allowNull: true },
  companyId: { type: DataTypes.INTEGER, allowNull: true },
  email: { type: DataTypes.STRING(255), allowNull: true },
  phone: { type: DataTypes.STRING(50), allowNull: true },
  location: { type: DataTypes.STRING(255), allowNull: true },
  source: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'website',
  },
  status: {
    type: DataTypes.ENUM(
      'NEW',
      'CONTACTED',
      'QUALIFIED',
      'PROPOSAL',
      'NEGOTIATION',
      'WON',
      'LOST'
    ),
    defaultValue: 'NEW',
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    defaultValue: 'MEDIUM',
  },
  assignedTo: { type: DataTypes.INTEGER, allowNull: true },
  industry: { type: DataTypes.STRING(150), allowNull: true },
  requirement: { type: DataTypes.TEXT, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  contactSubmissionId: { type: DataTypes.INTEGER, allowNull: true },
  estimatedValue: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
  // Customer Intelligence & AI Sales Prediction (see utils/leadScoring.js)
  aiScore: { type: DataTypes.INTEGER, allowNull: true },
  aiGrade: { type: DataTypes.ENUM('HOT', 'WARM', 'COLD'), allowNull: true },
}, {
  tableName: 'crm_leads',
  timestamps: true,
  indexes: [
    { fields: ['organizationId'] },
    { fields: ['status'] },
    { fields: ['email'] },
    { fields: ['assignedTo'] },
    { fields: ['source'] },
    { fields: ['priority'] },
    { fields: ['createdAt'] },
  ],
});

module.exports = Lead;
