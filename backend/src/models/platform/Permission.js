const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// A permission is a (resource, action) pair, e.g. ('lead', 'DELETE').
const ACTIONS = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'APPROVE', 'ASSIGN', 'MANAGE', 'CONFIGURE'];

const Permission = sequelize.define('Permission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  resource: { type: DataTypes.STRING(100), allowNull: false },
  action: { type: DataTypes.ENUM(...ACTIONS), allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'permissions',
  timestamps: true,
  indexes: [{ fields: ['resource', 'action'], unique: true }],
});

Permission.ACTIONS = ACTIONS;

module.exports = Permission;
