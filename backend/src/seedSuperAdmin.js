// Promotes the existing legacy CMS Admin into a platform "Super Admin" User
// so the SAME email + password that logs into /admin/login also unlocks the
// platform-side Super Admin sections (Organizations, Roles, Modules,
// Subscriptions, Audit Log).
//
// How it works: we don't need to know the plaintext password. We copy the
// Admin row's existing bcrypt `passwordHash` verbatim into a new/updated
// platform `User` row. Since both sides compare with bcrypt.compare(), the
// same password the person already types at /admin/login will also
// authenticate them against /api/platform-auth/login.
//
// Safe to re-run (findOrCreate + update). Run this once after pulling these
// changes, and again any time the CMS admin's email or password changes.
//
//   npm run seed:superadmin
//
require('dotenv').config();
const sequelize = require('./config/db');
const Admin = require('./models/Admin');
require('./models/platform/platformAssociations');
const { User, Role } = require('./models/platform/platformAssociations');

async function run() {
  await sequelize.authenticate();
  await sequelize.sync();

  const admin = await Admin.findOne({ order: [['id', 'ASC']] });
  if (!admin) {
    console.error('No CMS admin found in the `admins` table. Log in to /admin at least once (or run `npm run seed`) before running this script.');
    process.exit(1);
  }

  // Make sure the SUPER_ADMIN platform role exists (normally created by
  // `npm run seed:platform`, but this makes the script self-sufficient).
  await Role.findOrCreate({
    where: { name: 'SUPER_ADMIN' },
    defaults: { description: 'Platform staff. Full access across every organization.', isSystem: true },
  });

  let user = await User.findOne({ where: { email: admin.email } });

  if (user) {
    user.passwordHash = admin.passwordHash;
    user.name = admin.name;
    user.isSuperAdmin = true;
    user.status = 'ACTIVE';
    user.emailVerified = true;
    await user.save();
    console.log(`Updated existing platform user "${admin.email}" -> isSuperAdmin = true.`);
  } else {
    user = await User.create({
      name: admin.name,
      email: admin.email,
      passwordHash: admin.passwordHash,
      isSuperAdmin: true,
      status: 'ACTIVE',
      emailVerified: true,
      mobileVerified: false,
    });
    console.log(`Created platform super admin user for "${admin.email}".`);
  }

  console.log('\nDone. Log in at /admin/login with your usual CMS admin email + password —');
  console.log('the Organizations / Roles / Modules / Subscriptions / Audit Log sections will now work too.');
  console.log('\nIMPORTANT: if you ever change the CMS admin password from /admin, re-run');
  console.log('`npm run seed:superadmin` afterwards so the copied hash stays in sync.');

  process.exit(0);
}

run().catch((err) => {
  console.error('seedSuperAdmin failed:', err);
  process.exit(1);
});