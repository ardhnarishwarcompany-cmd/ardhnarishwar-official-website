const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const RolePermission = sequelize.define('RolePermission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  roleId: { type: DataTypes.INTEGER, allowNull: false },
  permissionId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'role_permissions',
  timestamps: true,
  indexes: [{ fields: ['roleId', 'permissionId'], unique: true }],
});

module.exports = RolePermission;
