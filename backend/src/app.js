const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const blogRoutes = require('./routes/blogRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const contactRoutes = require('./routes/contactRoutes');
const teamRoutes = require('./routes/teamRoutes');
const jobRoutes = require('./routes/jobRoutes');
const faqRoutes = require('./routes/faqRoutes');
const industryRoutes = require('./routes/industryRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const crmRoutes = require('./routes/crmRoutes');

// --- Phase 1: central platform (organizations, RBAC, modules, subscriptions) ---
const platformAuthRoutes = require('./routes/platformAuthRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const userRoutes = require('./routes/userRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const portalInquiryRoutes = require('./routes/portalInquiryRoutes');

// --- Phase 4: candidate (job-seeker) auth — separate from org platform ---
const candidateAuthRoutes = require('./routes/candidateAuthRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/industries', industryRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/crm', crmRoutes);

// --- Phase 1: central platform ---
// Note: platform auth is namespaced separately from /api/auth (which stays
// exactly as-is for the legacy CMS Admin login) to avoid touching existing
// behavior. Organization users log in via /api/platform-auth/login.
app.use('/api/platform-auth', platformAuthRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/portal/inquiries', portalInquiryRoutes);

// --- Phase 4: candidate portal ---
// Namespaced separately again, same reasoning as platform-auth above:
// candidates log in via /api/candidate-auth/login and get their own token
// type that can't be used on org or admin routes.
app.use('/api/candidate-auth', candidateAuthRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// Central error handler (e.g. multer file-type errors land here)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Something went wrong.' });
});

module.exports = app;
