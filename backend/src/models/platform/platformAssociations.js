const Organization = require('./Organization');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const OrganizationUser = require('./OrganizationUser');
const Module = require('./Module');
const OrganizationModule = require('./OrganizationModule');
const SubscriptionPlan = require('./SubscriptionPlan');
const Subscription = require('./Subscription');
const RefreshToken = require('./RefreshToken');
const AuditLog = require('./AuditLog');
const Notification = require('./Notification');

// Organization <-> User (many-to-many through OrganizationUser)
Organization.belongsToMany(User, { through: OrganizationUser, foreignKey: 'organizationId', otherKey: 'userId', as: 'members' });
User.belongsToMany(Organization, { through: OrganizationUser, foreignKey: 'userId', otherKey: 'organizationId', as: 'organizations' });

OrganizationUser.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
OrganizationUser.belongsTo(User, { foreignKey: 'userId', as: 'user' });
OrganizationUser.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Organization.hasMany(OrganizationUser, { foreignKey: 'organizationId', as: 'memberships' });
User.hasMany(OrganizationUser, { foreignKey: 'userId', as: 'memberships' });
Role.hasMany(OrganizationUser, { foreignKey: 'roleId', as: 'memberships' });

// Role <-> Permission
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId', otherKey: 'permissionId', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId', otherKey: 'roleId', as: 'roles' });

// Organization <-> Module
Organization.belongsToMany(Module, { through: OrganizationModule, foreignKey: 'organizationId', otherKey: 'moduleId', as: 'modules' });
Module.belongsToMany(Organization, { through: OrganizationModule, foreignKey: 'moduleId', otherKey: 'organizationId', as: 'organizations' });
OrganizationModule.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
OrganizationModule.belongsTo(Module, { foreignKey: 'moduleId', as: 'module' });

// Subscriptions
Organization.hasMany(Subscription, { foreignKey: 'organizationId', as: 'subscriptions' });
Subscription.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Subscription.belongsTo(SubscriptionPlan, { foreignKey: 'planId', as: 'plan' });
SubscriptionPlan.hasMany(Subscription, { foreignKey: 'planId', as: 'subscriptions' });

// Refresh tokens
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Audit log
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Organization.hasMany(AuditLog, { foreignKey: 'organizationId', as: 'auditLogs' });

// Notifications
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

module.exports = {
  Organization,
  User,
  Role,
  Permission,
  RolePermission,
  OrganizationUser,
  Module,
  OrganizationModule,
  SubscriptionPlan,
  Subscription,
  RefreshToken,
  AuditLog,
  Notification,
};
