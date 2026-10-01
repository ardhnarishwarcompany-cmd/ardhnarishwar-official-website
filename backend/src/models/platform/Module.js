const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// Catalog of platform functionality that can be toggled per organization
// (CRM, Analytics, Support, Project Tools, ...).
const Module = sequelize.define('Module', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  key: { type: DataTypes.STRING(100), allowNull: false, unique: true }, // 'crm', 'analytics'
  name: { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.STRING(500), allowNull: true },
  isCore: { type: DataTypes.BOOLEAN, defaultValue: false }, // always-on, can't be disabled
}, {
  tableName: 'modules',
  timestamps: true,
  indexes: [{ fields: ['key'], unique: true }],
});

module.exports = Module;
