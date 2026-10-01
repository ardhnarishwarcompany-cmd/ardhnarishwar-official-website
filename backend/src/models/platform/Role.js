const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// Global role catalog (Super Admin, Admin, HR, Recruiter, Manager,
// Employee, Client, Sales User, ...). Roles are platform-wide definitions;
// what varies per organization is which user holds which role there
// (see OrganizationUser) and which permissions that role carries
// (see RolePermission) — the latter is editable via the CONFIGURE action,
// so orgs are not stuck with hardcoded behavior per role.
const Role = sequelize.define('Role', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(500), allowNull: true },
  isSystem: { type: DataTypes.BOOLEAN, defaultValue: false }, // seeded, can't be deleted
}, {
  tableName: 'roles',
  timestamps: true,
  indexes: [{ fields: ['name'], unique: true }],
});

module.exports = Role;
