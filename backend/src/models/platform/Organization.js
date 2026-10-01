const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// A tenant. Every organization-owned record elsewhere in the platform
// (CRM leads, contacts, tickets, etc.) will carry an organizationId that
// points here, so cross-tenant access can be blocked at the query level,
// not just hidden in the UI.
const Organization = sequelize.define('Organization', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(255), allowNull: true },
  phone: { type: DataTypes.STRING(50), allowNull: true },
  website: { type: DataTypes.STRING(255), allowNull: true },
  industry: { type: DataTypes.STRING(150), allowNull: true },
  address: { type: DataTypes.STRING(500), allowNull: true },
  city: { type: DataTypes.STRING(150), allowNull: true },
  state: { type: DataTypes.STRING(150), allowNull: true },
  country: { type: DataTypes.STRING(150), allowNull: true },
  logoUrl: { type: DataTypes.STRING(500), allowNull: true },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE', 'TRIAL'),
    defaultValue: 'TRIAL',
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'organizations',
  timestamps: true,
  paranoid: true, // soft delete
  indexes: [
    { fields: ['status'] },
    { fields: ['slug'], unique: true },
  ],
});

module.exports = Organization;
