// Single source of truth for what resources/actions exist, and the default
// role → permission mapping used by seedPlatform.js. Editing an org's
// effective permissions afterwards is done via the /api/roles APIs
// (CONFIGURE action) — this file only defines sane starting defaults.

const RESOURCES = [
  'organization', 'user', 'role', 'permission', 'module', 'subscription',
  'lead', 'contact', 'company', 'opportunity', 'activity', 'task',
  'followup', 'note', 'ticket', 'report', 'auditlog', 'notification',
];

const ACTIONS = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'APPROVE', 'ASSIGN', 'MANAGE', 'CONFIGURE'];

// MANAGE is treated as a superset of VIEW/CREATE/EDIT/DELETE/ASSIGN for a
// resource by the RBAC middleware (see middleware/rbac.js) so we don't have
// to enumerate every action for admin-type roles.
const DEFAULT_ROLES = {
  SUPER_ADMIN: {
    description: 'Platform staff. Full access across every organization.',
    isSystem: true,
    permissions: null, // null = implicit all access, enforced in middleware via isSuperAdmin flag
  },
  ADMIN: {
    description: 'Organization administrator. Full access within their own organization.',
    isSystem: true,
    permissions: RESOURCES.map((r) => ({ resource: r, action: 'MANAGE' })),
  },
  MANAGER: {
    description: 'Manages a team\u2019s CRM work: assign, view reports, no destructive actions.',
    isSystem: true,
    permissions: [
      ...['lead', 'contact', 'company', 'opportunity', 'activity', 'task', 'followup', 'note', 'ticket'].flatMap((r) => (
        ['VIEW', 'CREATE', 'EDIT', 'ASSIGN'].map((a) => ({ resource: r, action: a }))
      )),
      { resource: 'report', action: 'VIEW' },
      { resource: 'report', action: 'EXPORT' },
      { resource: 'user', action: 'VIEW' },
      { resource: 'notification', action: 'VIEW' },
    ],
  },
  SALES_USER: {
    description: 'Works their own leads/opportunities. No delete, no export.',
    isSystem: true,
    permissions: [
      ...['lead', 'contact', 'company', 'opportunity', 'activity', 'task', 'followup', 'note'].flatMap((r) => (
        ['VIEW', 'CREATE', 'EDIT'].map((a) => ({ resource: r, action: a }))
      )),
      { resource: 'ticket', action: 'VIEW' },
      { resource: 'ticket', action: 'CREATE' },
      { resource: 'notification', action: 'VIEW' },
    ],
  },
  RECRUITER: {
    description: 'Placeholder role for future HR/recruiting module; limited CRM read access today.',
    isSystem: true,
    permissions: [
      { resource: 'contact', action: 'VIEW' },
      { resource: 'company', action: 'VIEW' },
      { resource: 'notification', action: 'VIEW' },
    ],
  },
  HR: {
    description: 'Placeholder role for future HR module; limited CRM read access today.',
    isSystem: true,
    permissions: [
      { resource: 'user', action: 'VIEW' },
      { resource: 'notification', action: 'VIEW' },
    ],
  },
  EMPLOYEE: {
    description: 'General org member with view-only CRM access.',
    isSystem: true,
    permissions: [
      ...['lead', 'contact', 'company', 'opportunity', 'task'].map((r) => ({ resource: r, action: 'VIEW' })),
      { resource: 'notification', action: 'VIEW' },
    ],
  },
  CLIENT: {
    description: 'External customer. Can only see and create their own support tickets.',
    isSystem: true,
    permissions: [
      { resource: 'ticket', action: 'VIEW' },
      { resource: 'ticket', action: 'CREATE' },
      { resource: 'notification', action: 'VIEW' },
    ],
  },
};

const DEFAULT_MODULES = [
  { key: 'crm', name: 'CRM', description: 'Leads, contacts, companies, opportunities, pipeline, tickets.', isCore: true },
  { key: 'analytics', name: 'Analytics', description: 'Executive-level cross-module reporting.', isCore: false },
  { key: 'support', name: 'Support Center', description: 'Customer-facing ticketing.', isCore: false },
  { key: 'project_tools', name: 'Project Tools', description: 'Reserved for a future project-management module.', isCore: false },
];

module.exports = { RESOURCES, ACTIONS, DEFAULT_ROLES, DEFAULT_MODULES };
