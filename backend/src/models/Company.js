const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Company = sequelize.define('Company', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  industry: { type: DataTypes.STRING(150), allowNull: true },
  website: { type: DataTypes.STRING(255), allowNull: true },
  email: { type: DataTypes.STRING(255), allowNull: true },
  phone: { type: DataTypes.STRING(50), allowNull: true },
  address: { type: DataTypes.STRING(500), allowNull: true },
  city: { type: DataTypes.STRING(100), allowNull: true },
  state: { type: DataTypes.STRING(100), allowNull: true },
  country: { type: DataTypes.STRING(100), allowNull: true },
  companySize: { type: DataTypes.STRING(50), allowNull: true },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'prospect'),
    defaultValue: 'prospect',
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'crm_companies',
  timestamps: true,
  indexes: [
    { fields: ['organizationId'] },
    { fields: ['name'] },
    { fields: ['email'] },
    { fields: ['status'] },
  ],
});

module.exports = Company;
