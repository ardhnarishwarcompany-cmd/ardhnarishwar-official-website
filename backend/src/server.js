require('dotenv').config();
const http = require('http');
const app = require('./app');
const sequelize = require('./config/db');
const { ensureOrganizationColumns } = require('./migrateOrgColumns');
const { ensureFeatureColumns, ensureEnumValues } = require('./migrateFeatureColumns');
const socket = require('./utils/socket');

// Import all models so Sequelize knows about them before syncing
require('./models/Admin');
require('./models/Service');
require('./models/BlogPost');
require('./models/Media');
require('./models/ContactSubmission');
require('./models/TeamMember');
require('./models/JobOpening');
require('./models/FaqItem');
require('./models/Industry');
require('./models/Testimonial');
require('./models/SiteSetting');
// CRM models + associations
require('./models/crmAssociations');
// Phase 1: central platform models + associations
require('./models/platform/platformAssociations');
// Phase 4: candidate (job-seeker) models + associations
require('./models/candidate/candidateAssociations');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Existing DBs may predate organizationId — add columns before sync indexes
    console.log('Checking CRM organizationId columns...');
    await ensureOrganizationColumns();

    console.log('Checking OTP + AI-scoring columns...');
    await ensureFeatureColumns();
    await ensureEnumValues();

    // Creates tables if they don't exist yet. For a real production
    // deployment, switch this to proper migrations instead.
    await sequelize.sync();
    console.log('Database synced.');

    // Wrap the Express app in a raw http server so Socket.io can share the
    // same port (real-time notifications — see utils/socket.js).
    const httpServer = http.createServer(app);
    socket.init(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Ardhnarishwar backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();