const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// Membership: which user belongs to which organization, with which role.
// This is the join table backend-level tenant checks hinge on — a request
// scoped to organization X is only allowed if the requesting user has an
// ACTIVE row here for X (or is a platform super admin).
const OrganizationUser = sequelize.define('OrganizationUser', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizationId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  roleId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INVITED', 'SUSPENDED'),
    defaultValue: 'ACTIVE',
  },
  isOwner: { type: DataTypes.BOOLEAN, defaultValue: false }, // org's primary/first admin
}, {
  tableName: 'organization_users',
  timestamps: true,
  indexes: [
    { fields: ['organizationId', 'userId'], unique: true },
    { fields: ['organizationId'] },
    { fields: ['userId'] },
  ],
});

module.exports = OrganizationUser;
