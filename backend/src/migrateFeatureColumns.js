/**
 * Ensures newly-added columns exist on tables that may already exist in a
 * deployed database (sequelize.sync() without {alter:true} only creates
 * missing tables, not missing columns on existing ones). Same pattern as
 * migrateOrgColumns.js.
 *
 *   node src/migrateFeatureColumns.js
 *   (also called automatically from server.js on startup)
 */
require('dotenv').config();
const sequelize = require('./config/db');

const COLUMNS = [
  // OTP-based Register -> Verify -> Login flow
  { table: 'platform_users', column: 'otpAttempts', ddl: 'INT NOT NULL DEFAULT 0' },
  { table: 'platform_users', column: 'mobileVerified', ddl: 'TINYINT(1) NOT NULL DEFAULT 0' },
  // CRM Customer Intelligence & AI Sales Prediction
  { table: 'crm_leads', column: 'aiScore', ddl: 'INT NULL' },
  { table: 'crm_leads', column: 'aiGrade', ddl: "VARCHAR(10) NULL" },
  // Service demo / login-gated access feature
  {
    table: 'services',
    column: 'accessType',
    ddl: "ENUM('organization','candidate','public','admin') NOT NULL DEFAULT 'organization'",
  },
  { table: 'services', column: 'demoEnabled', ddl: 'TINYINT(1) NOT NULL DEFAULT 1' },
  // Separate images: thumbnail (grid card), hero (solution page banner), CTA (bottom section)
  { table: 'services', column: 'heroImageUrl', ddl: 'VARCHAR(255) NULL' },
  { table: 'services', column: 'ctaImageUrl', ddl: 'VARCHAR(255) NULL' },
  // "Tools & Technology" summary shown on each solution's detail page
  { table: 'services', column: 'techSummary', ddl: 'TEXT NULL' },
  { table: 'services', column: 'techStack', ddl: 'JSON NULL' },
  // Real-data product preview: pulls live stats from the actual product's
  // API instead of the hardcoded demo numbers, when configured.
  { table: 'services', column: 'liveStatsUrl', ddl: 'VARCHAR(500) NULL' },
  { table: 'services', column: 'liveStatsApiKey', ddl: 'VARCHAR(255) NULL' },
  // YouTube link in the footer social flip buttons (admin-editable)
  { table: 'site_settings', column: 'youtubeUrl', ddl: 'VARCHAR(500) NULL' },
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

async function ensureFeatureColumns() {
  for (const { table, column, ddl } of COLUMNS) {
    if (!(await tableExists(table))) {
      console.log(`  skip ${table} (table not created yet)`);
      continue;
    }
    if (await columnExists(table, column)) {
      console.log(`  ok   ${table}.${column} already exists`);
      continue;
    }
    await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${ddl}`);
    console.log(`  add  ${table}.${column}`);
  }
}

// ADD COLUMN only helps for brand-new columns — it does nothing for a column
// that already exists but whose ENUM needs a new value added later (e.g.
// adding 'both' to services.accessType after it originally shipped with only
// organization/candidate/public/admin). This widens such ENUM columns in
// place, without touching any existing row data.
const ENUM_WIDENS = [
  {
    table: 'services',
    column: 'accessType',
    ddl: "ENUM('organization','candidate','both','public','admin') NOT NULL DEFAULT 'organization'",
  },
];

async function ensureEnumValues() {
  for (const { table, column, ddl } of ENUM_WIDENS) {
    if (!(await tableExists(table))) {
      console.log(`  skip ${table} (table not created yet)`);
      continue;
    }
    const [rows] = await sequelize.query(
      `SELECT COLUMN_TYPE AS type FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column`,
      { replacements: { table, column } }
    );
    const currentType = rows[0]?.type || '';
    if (/'both'/.test(currentType)) {
      console.log(`  ok   ${table}.${column} already allows 'both'`);
      continue;
    }
    await sequelize.query(`ALTER TABLE \`${table}\` MODIFY COLUMN \`${column}\` ${ddl}`);
    console.log(`  widen ${table}.${column} enum -> added 'both'`);
  }
}

async function main() {
  await sequelize.authenticate();
  console.log('Ensuring OTP + AI-scoring columns...');
  await ensureFeatureColumns();
  await ensureEnumValues();
  console.log('Done.');
  process.exit(0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { ensureFeatureColumns, ensureEnumValues };