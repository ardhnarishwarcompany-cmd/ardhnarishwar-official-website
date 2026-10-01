// Seeds the Phase 1 platform: permission catalog, default roles + their
// permission grants, module catalog, and a default Free/Trial plan.
// Safe to re-run — everything is findOrCreate'd.
//
//   npm run seed:platform
//
require('dotenv').config();
const sequelize = require('./config/db');
require('./models/platform/platformAssociations');
const { Role, Permission, RolePermission, Module, SubscriptionPlan, Organization, OrganizationModule } = require('./models/platform/platformAssociations');
const { RESOURCES, ACTIONS, DEFAULT_ROLES, DEFAULT_MODULES } = require('./utils/permissionCatalog');

async function run() {
  await sequelize.authenticate();
  await sequelize.sync();

  console.log('Seeding permissions...');
  const permissionByKey = {};
  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      const [perm] = await Permission.findOrCreate({ where: { resource, action } });
      permissionByKey[`${resource}.${action}`] = perm;
    }
  }

  console.log('Seeding roles...');
  for (const [name, def] of Object.entries(DEFAULT_ROLES)) {
    const [role] = await Role.findOrCreate({ where: { name }, defaults: { description: def.description, isSystem: def.isSystem } });
    if (def.permissions) {
      for (const { resource, action } of def.permissions) {
        const perm = permissionByKey[`${resource}.${action}`];
        if (!perm) continue;
        await RolePermission.findOrCreate({ where: { roleId: role.id, permissionId: perm.id } });
      }
    }
  }

  console.log('Seeding modules...');
  for (const mod of DEFAULT_MODULES) {
    await Module.findOrCreate({ where: { key: mod.key }, defaults: mod });
  }

  console.log('Seeding default subscription plan...');
  await SubscriptionPlan.findOrCreate({
    where: { name: 'Free Trial' },
    defaults: {
      description: '14-day trial with core CRM access.',
      price: 0,
      billingCycle: 'TRIAL',
      features: ['crm'],
      limits: { maxUsers: 5, maxLeads: 500 },
      status: 'ACTIVE',
    },
  });

  await SubscriptionPlan.findOrCreate({
    where: { name: 'Starter' },
    defaults: {
      description: 'For small teams getting started with CRM and hiring tools.',
      price: 2999,
      billingCycle: 'MONTHLY',
      features: ['crm', 'jobs', 'basic_analytics'],
      limits: { maxUsers: 10, maxLeads: 2000 },
      status: 'ACTIVE',
    },
  });

  await SubscriptionPlan.findOrCreate({
    where: { name: 'Growth' },
    defaults: {
      description: 'Scale recruitment and HR operations across a growing org.',
      price: 7999,
      billingCycle: 'MONTHLY',
      features: ['crm', 'jobs', 'hrms', 'analytics', 'priority_support'],
      limits: { maxUsers: 50, maxLeads: 15000 },
      status: 'ACTIVE',
    },
  });

  await SubscriptionPlan.findOrCreate({
    where: { name: 'Enterprise' },
    defaults: {
      description: 'Custom limits, dedicated success manager, and full module access.',
      price: 19999,
      billingCycle: 'MONTHLY',
      features: ['crm', 'jobs', 'hrms', 'analytics', 'sso', 'dedicated_support', 'custom_integrations'],
      limits: { maxUsers: 500, maxLeads: 100000 },
      status: 'ACTIVE',
    },
  });

  // Default organization (id preferably 1) so legacy CRM data and website leads have a tenant home.
  console.log('Seeding default organization...');
  const [defaultOrg] = await Organization.findOrCreate({
    where: { slug: 'default' },
    defaults: {
      name: 'Ardhnarishwar Default',
      status: 'ACTIVE',
      email: process.env.SEED_ADMIN_EMAIL || 'admin@ardhnarishwar.com',
    },
  });
  console.log('  Default organization id=', defaultOrg.id);

  // Ensure CRM module is enabled for default org
  const crmMod = await Module.findOne({ where: { key: 'crm' } });
  if (crmMod) {
    await OrganizationModule.findOrCreate({
      where: { organizationId: defaultOrg.id, moduleId: crmMod.id },
      defaults: { enabled: true },
    });
  }

  // Backfill organizationId on existing CRM rows that are still NULL (safe, idempotent)
  console.log('Backfilling organizationId on CRM tables...');
  const tables = [
    'crm_leads', 'crm_contacts', 'crm_companies', 'crm_opportunities',
    'crm_activities', 'crm_tasks', 'crm_followups', 'crm_notes',
    'crm_tickets', 'crm_ticket_comments',
  ];
  for (const table of tables) {
    try {
      const sql = 'UPDATE `' + table + '` SET organizationId = :orgId WHERE organizationId IS NULL';
      await sequelize.query(sql, { replacements: { orgId: defaultOrg.id } });
      console.log('  ' + table + ': backfill attempted');
    } catch (e) {
      // Table may not exist yet on first run
      console.log('  ' + table + ': skipped (' + e.message.slice(0, 60) + ')');
    }
  }

  console.log('Platform seed complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Platform seed failed:', err);
  process.exit(1);
});
