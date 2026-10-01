const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Contact = sequelize.define('Contact', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: true },
  firstName: { type: DataTypes.STRING(100), allowNull: false },
  lastName: { type: DataTypes.STRING(100), allowNull: true },
  email: { type: DataTypes.STRING(255), allowNull: true },
  phone: { type: DataTypes.STRING(50), allowNull: true },
  jobTitle: { type: DataTypes.STRING(150), allowNull: true },
  companyId: { type: DataTypes.INTEGER, allowNull: true },
  companyName: { type: DataTypes.STRING(255), allowNull: true },
  address: { type: DataTypes.STRING(500), allowNull: true },
  city: { type: DataTypes.STRING(100), allowNull: true },
  country: { type: DataTypes.STRING(100), allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'crm_contacts',
  timestamps: true,
  indexes: [
    { fields: ['organizationId'] },
    { fields: ['email'] },
    { fields: ['companyId'] },
    { fields: ['lastName', 'firstName'] },
  ],
});

module.exports = Contact;
