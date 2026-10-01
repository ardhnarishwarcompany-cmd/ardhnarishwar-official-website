const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { requireAdmin } = require('../middleware/auth');
const { requireUser, requireOrganization } = require('../middleware/platformAuth');
const { requirePermission } = require('../middleware/rbac');
const crm = require('../controllers/crmController');
const { OrganizationUser, Organization } = require('../models/platform/platformAssociations');

/**
 * Dual auth for CRM:
 * 1. Prefer platform (organization) user token.
 * 2. Fall back to legacy CMS admin token and attach a default organizationId=1
 *    so existing admin CRM UI continues to work while multi-tenant rolls out.
 */
async function crmAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'No token provided.' });
  }

  // Try platform token first
  try {
    const payload = jwt.verify(token, process.env.PLATFORM_JWT_SECRET || process.env.JWT_SECRET);
    if (payload.type === 'access') {
      // Re-use requireUser logic lightly
      const { User } = require('../models/platform/platformAssociations');
      const user = await User.findByPk(payload.id);
      if (!user || user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
        return res.status(401).json({ error: 'Account is not active.' });
      }
      req.user = { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin };

      // Resolve organization
      if (req.user.isSuperAdmin) {
        req.organizationId = req.params.organizationId
          ? Number(req.params.organizationId)
          : (req.query.organizationId ? Number(req.query.organizationId) : (req.headers['x-organization-id'] ? Number(req.headers['x-organization-id']) : null));
        // If super admin didn't specify, allow but queries without org filter will return all (or force default)
        if (!req.organizationId) req.organizationId = 1; // safe default for admin UI
        return next();
      }

      const requestedOrgId = req.params.organizationId || req.query.organizationId || req.headers['x-organization-id'];
      const where = { userId: req.user.id, status: 'ACTIVE' };
      if (requestedOrgId) where.organizationId = Number(requestedOrgId);

      const membership = await OrganizationUser.findOne({
        where,
        include: [{ association: 'role' }, { association: 'organization' }],
      });
      if (!membership) {
        return res.status(403).json({ error: 'No active membership for this organization.' });
      }
      if (membership.organization.status === 'SUSPENDED' || membership.organization.status === 'INACTIVE') {
        return res.status(403).json({ error: 'This organization is not active.' });
      }
      req.organizationId = membership.organizationId;
      req.membership = membership;
      return next();
    }
  } catch (e) {
    // not a platform token — fall through to legacy admin
  }

  // Legacy admin fallback
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload; // { id, email }
    // Default organization for legacy CMS admin CRM views
    req.organizationId = 1;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

router.use(crmAuth);

// ---- Dashboard & reports
router.get('/dashboard', requirePermission('report', 'VIEW'), crm.dashboard);
router.get('/reports', requirePermission('report', 'VIEW'), crm.reports);
router.get('/search', requirePermission('lead', 'VIEW'), crm.globalSearch);
router.get('/export/:type', requirePermission('report', 'EXPORT'), crm.exportData);

// ---- Pipeline
router.get('/pipeline', requirePermission('opportunity', 'VIEW'), crm.getPipeline);
router.patch('/pipeline/:id/stage', requirePermission('opportunity', 'EDIT'), crm.movePipelineStage);

// ---- Leads
router.get('/leads', requirePermission('lead', 'VIEW'), crm.listLeads);
router.get('/leads/:id', requirePermission('lead', 'VIEW'), crm.getLead);
router.post('/leads', requirePermission('lead', 'CREATE'), crm.createLead);
router.put('/leads/:id', requirePermission('lead', 'EDIT'), crm.updateLead);
router.delete('/leads/:id', requirePermission('lead', 'DELETE'), crm.deleteLead);

// ---- Contacts
router.get('/contacts', requirePermission('contact', 'VIEW'), crm.listContacts);
router.get('/contacts/:id', requirePermission('contact', 'VIEW'), crm.getContact);
router.post('/contacts', requirePermission('contact', 'CREATE'), crm.createContact);
router.put('/contacts/:id', requirePermission('contact', 'EDIT'), crm.updateContact);
router.delete('/contacts/:id', requirePermission('contact', 'DELETE'), crm.deleteContact);

// ---- Companies
router.get('/companies', requirePermission('company', 'VIEW'), crm.listCompanies);
router.get('/companies/:id', requirePermission('company', 'VIEW'), crm.getCompany);
router.post('/companies', requirePermission('company', 'CREATE'), crm.createCompany);
router.put('/companies/:id', requirePermission('company', 'EDIT'), crm.updateCompany);
router.delete('/companies/:id', requirePermission('company', 'DELETE'), crm.deleteCompany);

// ---- Opportunities
router.get('/opportunities', requirePermission('opportunity', 'VIEW'), crm.listOpportunities);
router.get('/opportunities/:id', requirePermission('opportunity', 'VIEW'), crm.getOpportunity);
router.post('/opportunities', requirePermission('opportunity', 'CREATE'), crm.createOpportunity);
router.put('/opportunities/:id', requirePermission('opportunity', 'EDIT'), crm.updateOpportunity);
router.delete('/opportunities/:id', requirePermission('opportunity', 'DELETE'), crm.deleteOpportunity);

// ---- Activities
router.get('/activities', requirePermission('activity', 'VIEW'), crm.listActivities);
router.post('/activities', requirePermission('activity', 'CREATE'), crm.createActivity);
router.put('/activities/:id', requirePermission('activity', 'EDIT'), crm.updateActivity);
router.delete('/activities/:id', requirePermission('activity', 'DELETE'), crm.deleteActivity);

// ---- Tasks
router.get('/tasks', requirePermission('task', 'VIEW'), crm.listTasks);
router.post('/tasks', requirePermission('task', 'CREATE'), crm.createTask);
router.put('/tasks/:id', requirePermission('task', 'EDIT'), crm.updateTask);
router.delete('/tasks/:id', requirePermission('task', 'DELETE'), crm.deleteTask);

// ---- Follow-ups
router.get('/followups', requirePermission('followup', 'VIEW'), crm.listFollowUps);
router.post('/followups', requirePermission('followup', 'CREATE'), crm.createFollowUp);
router.put('/followups/:id', requirePermission('followup', 'EDIT'), crm.updateFollowUp);
router.delete('/followups/:id', requirePermission('followup', 'DELETE'), crm.deleteFollowUp);

// ---- Notes
router.get('/notes', requirePermission('note', 'VIEW'), crm.listNotes);
router.post('/notes', requirePermission('note', 'CREATE'), crm.createNote);
router.delete('/notes/:id', requirePermission('note', 'DELETE'), crm.deleteNote);

// ---- Tickets
router.get('/tickets', requirePermission('ticket', 'VIEW'), crm.listTickets);
router.get('/tickets/:id', requirePermission('ticket', 'VIEW'), crm.getTicket);
router.post('/tickets', requirePermission('ticket', 'CREATE'), crm.createTicket);
router.put('/tickets/:id', requirePermission('ticket', 'EDIT'), crm.updateTicket);
router.post('/tickets/:id/comments', requirePermission('ticket', 'EDIT'), crm.addTicketComment);
router.delete('/tickets/:id', requirePermission('ticket', 'DELETE'), crm.deleteTicket);

// ---- Convert website submission → lead
router.post('/convert-submission/:id', requirePermission('lead', 'CREATE'), crm.convertSubmissionToLead);

module.exports = router;
