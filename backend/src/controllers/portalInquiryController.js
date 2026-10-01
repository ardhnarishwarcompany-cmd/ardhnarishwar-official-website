const Lead = require('../models/Lead');
const { Organization } = require('../models/platform/platformAssociations');
const { computeLeadScore } = require('../utils/leadScoring');

const ADMIN_ORG_ID = 1; // Ardhnarishwar's own CRM organization

// Client-portal inquiries. GENERAL is the only live request type — the
// client describes a requirement in free text and it lands in the admin
// CRM as a lead. (Module activation / plan-change requests used to be
// raised from here too; that flow was removed from the client Workspace,
// so only GENERAL is accepted now. Plan upgrades go through the separate
// /plan-request flow in platformAuthController instead.)
const SOURCE_GENERAL = 'portal_client';

// Legacy sources from the old module/plan request flow — no longer
// created, but kept here so any pre-existing leads still show up in
// listMine() for clients who raised them before this was removed.
const LEGACY_SOURCES = ['portal_module_request', 'portal_plan_request'];

async function create(req, res) {
  try {
    const { subject, message, phone, priority } = req.body;

    if (!message) return res.status(400).json({ error: 'Please describe your requirement.' });

    const user = req.user || {};
    let orgName = null;
    if (req.organizationId) {
      const org = await Organization.findByPk(req.organizationId);
      orgName = org?.name || null;
    }

    const requirement = subject ? `${subject}: ${message}` : message;
    const source = SOURCE_GENERAL;

    const { score, grade } = computeLeadScore({
      email: user.email,
      phone,
      company: orgName,
      requirement,
      source,
      priority: priority || 'MEDIUM',
    });

    const lead = await Lead.create({
      name: user.name || orgName || 'Client inquiry',
      email: user.email || null,
      phone: phone || null,
      company: orgName,
      requirement,
      notes: JSON.stringify({ type: 'GENERAL' }),
      source,
      status: 'NEW',
      priority: priority || 'MEDIUM',
      organizationId: ADMIN_ORG_ID,
      aiScore: score,
      aiGrade: grade,
    });

    res.status(201).json({ success: true, lead: { id: lead.id, status: lead.status } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit request.', details: err.message });
  }
}

// List every inquiry this client has submitted, matched by their email.
// Includes legacy module/plan-request leads (if any) so nothing they
// raised in the past silently disappears from their history.
async function listMine(req, res) {
  try {
    const user = req.user || {};
    if (!user.email) return res.json([]);
    const leads = await Lead.findAll({
      where: { email: user.email, source: [SOURCE_GENERAL, ...LEGACY_SOURCES], organizationId: ADMIN_ORG_ID },
      order: [['createdAt', 'DESC']],
    });
    res.json(leads.map((l) => {
      let meta = { type: 'GENERAL' };
      try { meta = { ...meta, ...JSON.parse(l.notes || '{}') }; } catch (_) { /* legacy rows without notes */ }
      return {
        id: l.id,
        type: meta.type,
        moduleName: meta.moduleName || null,
        planName: meta.planName || null,
        requirement: l.requirement,
        status: l.status,
        priority: l.priority,
        createdAt: l.createdAt,
      };
    }));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load your requests.', details: err.message });
  }
}

module.exports = { create, listMine };