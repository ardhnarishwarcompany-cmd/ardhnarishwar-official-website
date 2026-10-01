/**
 * Ensures organizationId exists on all CRM tables before Sequelize sync
 * tries to create indexes on that column.
 *
 *   node src/migrateOrgColumns.js
 *   (also called automatically from server.js on startup)
 */
require('dotenv').config();
const sequelize = require('./config/db');

const TABLES = [
  'crm_leads',
  'crm_contacts',
  'crm_companies',
  'crm_opportunities',
  'crm_activities',
  'crm_tasks',
  'crm_followups',
  'crm_notes',
  'crm_tickets',
  'crm_ticket_comments',
];

async function columnExists(table, column) {
  const [rows] = await sequelize.query(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = :table
       AND COLUMN_NAME = :column`,
    { replacements: { table, column } }
  );
  return Number(rows[0]?.cnt || 0) > 0;
}

async function tableExists(table) {
  const [rows] = await sequelize.query(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = :table`,
    { replacements: { table } }
  );
  return Number(rows[0]?.cnt || 0) > 0;
}

async function ensureOrganizationColumns() {
  for (const table of TABLES) {
    if (!(await tableExists(table))) {
      console.log(`  skip ${table} (table not created yet)`);
      continue;
    }
    if (await columnExists(table, 'organizationId')) {
      console.log(`  ok   ${table}.organizationId already exists`);
      continue;
    }
    await sequelize.query(
      `ALTER TABLE \`${table}\` ADD COLUMN \`organizationId\` INT NULL`
    );
    console.log(`  add  ${table}.organizationId`);
    // Index — ignore if Sequelize or a previous run already created it
    try {
      await sequelize.query(
        `CREATE INDEX \`${table}_organization_id\` ON \`${table}\` (\`organizationId\`)`
      );
    } catch (e) {
      // duplicate key name is fine
    }
  }
}

async function main() {
  await sequelize.authenticate();
  console.log('Ensuring organizationId columns on CRM tables...');
  await ensureOrganizationColumns();
  console.log('Done.');
  process.exit(0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { ensureOrganizationColumns };
