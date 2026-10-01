const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const OrganizationModule = sequelize.define('OrganizationModule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  moduleId: { type: DataTypes.INTEGER, allowNull: false },
  enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  enabledAt: { type: DataTypes.DATE, allowNull: true },
  disabledAt: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'organization_modules',
  timestamps: true,
  indexes: [{ fields: ['organizationId', 'moduleId'], unique: true }],
});

module.exports = OrganizationModule;
