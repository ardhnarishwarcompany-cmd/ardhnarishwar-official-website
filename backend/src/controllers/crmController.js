const { Op, fn, col, literal } = require('sequelize');
const {
  Company, Contact, Lead, Opportunity, Activity, Task, FollowUp, Note, Ticket, TicketComment,
} = require('../models/crmAssociations');
const { notifyUser } = require('../utils/notify');
const { computeLeadScore } = require('../utils/leadScoring');


// ---------- helpers ----------
function paginate(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function buildSearch(where, search, fields) {
  if (!search || !search.trim()) return where;
  const term = `%${search.trim()}%`;
  where[Op.or] = fields.map((f) => ({ [f]: { [Op.like]: term } }));
  return where;
}

/** Tenant scope: always filter by organizationId when present on the request. */
function orgScope(req) {
  if (req.organizationId != null) return { organizationId: req.organizationId };
  return {};
}

/** Merge org scope into a where clause. */
function withOrg(req, where = {}) {
  return { ...where, ...orgScope(req) };
}

/** Actor id for createdBy / author fields (platform user or legacy admin). */
function actorId(req) {
  return req.user?.id || req.admin?.id || null;
}

// ===================== DASHBOARD =====================
async function dashboard(req, res) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const o = orgScope(req);

    const [
      totalLeads,
      newLeads,
      qualifiedLeads,
      hotLeads,
      openOpps,
      wonDeals,
      lostDeals,
      followUpsDue,
      tasksDue,
      recentLeads,
      recentActivities,
      pipelineByStage,
      leadsByStatus,
      revenueAgg,
    ] = await Promise.all([
      Lead.count({ where: o }),
      Lead.count({ where: { ...o, status: 'NEW' } }),
      Lead.count({ where: { ...o, status: 'QUALIFIED' } }),
      Lead.count({ where: { ...o, aiGrade: 'HOT' } }),
      Opportunity.count({ where: { ...o, status: 'OPEN' } }),
      Opportunity.count({ where: { ...o, status: 'WON' } }),
      Opportunity.count({ where: { ...o, status: 'LOST' } }),
      FollowUp.count({
        where: {
          ...o,
          status: 'pending',
          dueDate: { [Op.lte]: new Date(startOfToday.getTime() + 86400000) },
        },
      }),
      Task.count({
        where: {
          ...o,
          status: { [Op.in]: ['TODO', 'IN_PROGRESS'] },
          dueDate: { [Op.lte]: new Date(startOfToday.getTime() + 86400000) },
        },
      }),
      Lead.findAll({
        where: o,
        order: [['createdAt', 'DESC']],
        limit: 8,
        attributes: ['id', 'name', 'company', 'email', 'status', 'priority', 'source', 'aiScore', 'aiGrade', 'createdAt'],
      }),
      Activity.findAll({
        where: o,
        order: [['activityDate', 'DESC']],
        limit: 10,
        attributes: ['id', 'type', 'subject', 'description', 'activityDate', 'leadId', 'contactId', 'opportunityId'],
      }),
      Opportunity.findAll({
        where: o,
        attributes: ['stage', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('expectedValue')), 'totalValue']],
        group: ['stage'],
        raw: true,
      }),
      Lead.findAll({
        where: o,
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),
      Opportunity.findAll({
        where: o,
        attributes: [
          [fn('SUM', literal("CASE WHEN status = 'WON' THEN expectedValue ELSE 0 END")), 'wonRevenue'],
          [fn('SUM', literal("CASE WHEN status = 'OPEN' THEN expectedValue ELSE 0 END")), 'pipelineValue'],
        ],
        raw: true,
      }),
    ]);

    const totalClosed = wonDeals + lostDeals;
    const conversionRate = totalClosed > 0 ? Math.round((wonDeals / totalClosed) * 1000) / 10 : 0;
    const wonRevenue = parseFloat(revenueAgg[0]?.wonRevenue || 0);
    const pipelineValue = parseFloat(revenueAgg[0]?.pipelineValue || 0);

    res.json({
      kpis: {
        totalLeads,
        newLeads,
        qualifiedLeads,
        hotLeads,
        openOpportunities: openOpps,
        wonDeals,
        lostDeals,
        conversionRate,
        followUpsDue,
        tasksDue,
        wonRevenue,
        pipelineValue,
      },
      recentLeads,
      recentActivities,
      pipelineByStage,
      leadsByStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load CRM dashboard.', details: err.message });
  }
}

// ===================== LEADS =====================
async function listLeads(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = withOrg(req);
    if (req.query.status) where.status = req.query.status;
    if (req.query.priority) where.priority = req.query.priority;
    if (req.query.source) where.source = req.query.source;
    if (req.query.assignedTo) where.assignedTo = req.query.assignedTo;
    buildSearch(where, req.query.search, ['name', 'company', 'email', 'phone', 'requirement']);

    const orderField = req.query.sort || 'createdAt';
    const orderDir = (req.query.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { rows, count } = await Lead.findAndCountAll({
      where,
      order: [[orderField, orderDir]],
      limit,
      offset,
    });

    res.json({ data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Could not load leads.', details: err.message });
  }
}

async function getLead(req, res) {
  try {
    const lead = await Lead.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });

    const [activities, tasks, followUps, notes, opportunities] = await Promise.all([
      Activity.findAll({ where: { leadId: lead.id }, order: [['activityDate', 'DESC']] }),
      Task.findAll({ where: { leadId: lead.id }, order: [['dueDate', 'ASC']] }),
      FollowUp.findAll({ where: { leadId: lead.id }, order: [['dueDate', 'ASC']] }),
      Note.findAll({ where: { leadId: lead.id }, order: [['createdAt', 'DESC']] }),
      Opportunity.findAll({ where: { leadId: lead.id }, order: [['createdAt', 'DESC']] }),
    ]);

    // Customer Journey Mapping: merge every touchpoint into one
    // chronological timeline so a rep can see the full relationship at a
    // glance instead of switching between tabs.
    const journey = [
      { type: 'LEAD_CREATED', date: lead.createdAt, label: 'Lead entered CRM', detail: `Source: ${lead.source || 'unknown'}` },
      ...activities.map((a) => ({ type: 'ACTIVITY', date: a.activityDate || a.createdAt, label: a.subject || a.type, detail: a.description })),
      ...notes.map((n) => ({ type: 'NOTE', date: n.createdAt, label: 'Note added', detail: n.content })),
      ...tasks.map((t) => ({ type: 'TASK', date: t.createdAt, label: `Task: ${t.title}`, detail: `Status: ${t.status}` })),
      ...followUps.map((f) => ({ type: 'FOLLOWUP', date: f.createdAt, label: `Follow-up: ${f.title}`, detail: `Due: ${f.dueDate}, Status: ${f.status}` })),
      ...opportunities.map((o) => ({ type: 'OPPORTUNITY', date: o.createdAt, label: `Opportunity: ${o.title}`, detail: `Stage: ${o.stage}, Status: ${o.status}` })),
    ]
      .filter((e) => e.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ ...lead.toJSON(), activities, tasks, followUps, notes, opportunities, journey });
  } catch (err) {
    res.status(500).json({ error: 'Could not load lead.', details: err.message });
  }
}

async function createLead(req, res) {
  try {
    const body = req.body;
    if (!body.name) return res.status(400).json({ error: 'Name is required.' });

    // Duplicate detection by email or phone
    if (body.email || body.phone) {
      const dupWhere = { [Op.or]: [] };
      if (body.email) dupWhere[Op.or].push({ email: body.email });
      if (body.phone) dupWhere[Op.or].push({ phone: body.phone });
      const existing = await Lead.findOne({ where: withOrg(req, dupWhere) });
      if (existing) {
        return res.status(409).json({
          error: 'Possible duplicate lead found.',
          existingId: existing.id,
          existing,
        });
      }
    }

    const { score, grade } = computeLeadScore(body);
    const lead = await Lead.create({
      ...body,
      aiScore: score,
      aiGrade: grade,
      organizationId: req.organizationId || body.organizationId || null,
      createdBy: actorId(req),
    });
    if (lead.assignedTo) {
      notifyUser({
        organizationId: lead.organizationId,
        userId: lead.assignedTo,
        type: 'LEAD_ASSIGNED',
        title: `New lead assigned: ${lead.name}`,
        message: lead.company ? `Company: ${lead.company}` : null,
        relatedEntityType: 'lead',
        relatedEntityId: lead.id,
      });
    }
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ error: 'Could not create lead.', details: err.message });
  }
}

async function updateLead(req, res) {
  try {
    const lead = await Lead.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });
    // Prevent moving to another org
    const { organizationId, ...safeBody } = req.body;
    const prevAssigned = lead.assignedTo;
    // Recompute the AI score whenever quality-relevant fields change, using
    // the merged (existing + incoming) lead data.
    const merged = { ...lead.toJSON(), ...safeBody };
    const { score, grade } = computeLeadScore(merged);
    safeBody.aiScore = score;
    safeBody.aiGrade = grade;
    await lead.update(safeBody);
    if (safeBody.assignedTo && safeBody.assignedTo !== prevAssigned) {
      notifyUser({
        organizationId: lead.organizationId,
        userId: safeBody.assignedTo,
        type: 'LEAD_ASSIGNED',
        title: `Lead assigned to you: ${lead.name}`,
        relatedEntityType: 'lead',
        relatedEntityId: lead.id,
      });
    }
    res.json(lead);
  } catch (err) {
    res.status(400).json({ error: 'Could not update lead.', details: err.message });
  }
}

async function deleteLead(req, res) {
  try {
    const lead = await Lead.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });
    await lead.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete lead.', details: err.message });
  }
}

// ===================== CONTACTS =====================
async function listContacts(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = withOrg(req);
    if (req.query.companyId) where.companyId = req.query.companyId;
    buildSearch(where, req.query.search, ['firstName', 'lastName', 'email', 'phone', 'companyName', 'jobTitle']);

    const { rows, count } = await Contact.findAndCountAll({
      where,
      order: [['updatedAt', 'DESC']],
      limit,
      offset,
      include: [{ model: Company, as: 'company', attributes: ['id', 'name'] }],
    });
    res.json({ data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Could not load contacts.', details: err.message });
  }
}

async function getContact(req, res) {
  try {
    const contact = await Contact.findOne({ where: withOrg(req, { id: req.params.id }),
      include: [{ model: Company, as: 'company' }],
    });
    if (!contact) return res.status(404).json({ error: 'Contact not found.' });
    const [activities, tasks, notes] = await Promise.all([
      Activity.findAll({ where: { contactId: contact.id }, order: [['activityDate', 'DESC']] }),
      Task.findAll({ where: { contactId: contact.id }, order: [['dueDate', 'ASC']] }),
      Note.findAll({ where: { contactId: contact.id }, order: [['createdAt', 'DESC']] }),
    ]);
    res.json({ ...contact.toJSON(), activities, tasks, notes });
  } catch (err) {
    res.status(500).json({ error: 'Could not load contact.', details: err.message });
  }
}

async function createContact(req, res) {
  try {
    if (!req.body.firstName) return res.status(400).json({ error: 'First name is required.' });
    const contact = await Contact.create({ ...req.body, organizationId: req.organizationId || null, createdBy: actorId(req) });
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: 'Could not create contact.', details: err.message });
  }
}

async function updateContact(req, res) {
  try {
    const contact = await Contact.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!contact) return res.status(404).json({ error: 'Contact not found.' });
    await contact.update(req.body);
    res.json(contact);
  } catch (err) {
    res.status(400).json({ error: 'Could not update contact.', details: err.message });
  }
}

async function deleteContact(req, res) {
  try {
    const contact = await Contact.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!contact) return res.status(404).json({ error: 'Contact not found.' });
    await contact.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete contact.', details: err.message });
  }
}

// ===================== COMPANIES =====================
async function listCompanies(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = withOrg(req);
    if (req.query.status) where.status = req.query.status;
    if (req.query.industry) where.industry = req.query.industry;
    buildSearch(where, req.query.search, ['name', 'email', 'phone', 'city', 'country']);

    const { rows, count } = await Company.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit,
      offset,
    });
    res.json({ data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Could not load companies.', details: err.message });
  }
}

async function getCompany(req, res) {
  try {
    const company = await Company.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!company) return res.status(404).json({ error: 'Company not found.' });
    const [contacts, leads, opportunities, activities, notes] = await Promise.all([
      Contact.findAll({ where: { companyId: company.id } }),
      Lead.findAll({ where: { companyId: company.id } }),
      Opportunity.findAll({ where: { companyId: company.id } }),
      Activity.findAll({ where: { companyId: company.id }, order: [['activityDate', 'DESC']], limit: 20 }),
      Note.findAll({ where: { companyId: company.id }, order: [['createdAt', 'DESC']] }),
    ]);
    res.json({ ...company.toJSON(), contacts, leads, opportunities, activities, notes });
  } catch (err) {
    res.status(500).json({ error: 'Could not load company.', details: err.message });
  }
}

async function createCompany(req, res) {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'Company name is required.' });
    const company = await Company.create({ ...req.body, organizationId: req.organizationId || null, createdBy: actorId(req) });
    res.status(201).json(company);
  } catch (err) {
    res.status(400).json({ error: 'Could not create company.', details: err.message });
  }
}

async function updateCompany(req, res) {
  try {
    const company = await Company.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!company) return res.status(404).json({ error: 'Company not found.' });
    await company.update(req.body);
    res.json(company);
  } catch (err) {
    res.status(400).json({ error: 'Could not update company.', details: err.message });
  }
}

async function deleteCompany(req, res) {
  try {
    const company = await Company.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!company) return res.status(404).json({ error: 'Company not found.' });
    await company.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete company.', details: err.message });
  }
}

// ===================== OPPORTUNITIES =====================
async function listOpportunities(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = withOrg(req);
    if (req.query.stage) where.stage = req.query.stage;
    if (req.query.status) where.status = req.query.status;
    if (req.query.ownerId) where.ownerId = req.query.ownerId;
    if (req.query.companyId) where.companyId = req.query.companyId;
    buildSearch(where, req.query.search, ['title', 'notes']);

    const { rows, count } = await Opportunity.findAndCountAll({
      where,
      order: [['updatedAt', 'DESC']],
      limit,
      offset,
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: Contact, as: 'contact', attributes: ['id', 'firstName', 'lastName', 'email'] },
      ],
    });
    res.json({ data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Could not load opportunities.', details: err.message });
  }
}

async function getOpportunity(req, res) {
  try {
    const opp = await Opportunity.findOne({ where: withOrg(req, { id: req.params.id }),
      include: [
        { model: Company, as: 'company' },
        { model: Contact, as: 'contact' },
        { model: Lead, as: 'lead' },
      ],
    });
    if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });
    const [activities, tasks, notes, followUps] = await Promise.all([
      Activity.findAll({ where: { opportunityId: opp.id }, order: [['activityDate', 'DESC']] }),
      Task.findAll({ where: { opportunityId: opp.id } }),
      Note.findAll({ where: { opportunityId: opp.id }, order: [['createdAt', 'DESC']] }),
      FollowUp.findAll({ where: { opportunityId: opp.id } }),
    ]);
    res.json({ ...opp.toJSON(), activities, tasks, notes, followUps });
  } catch (err) {
    res.status(500).json({ error: 'Could not load opportunity.', details: err.message });
  }
}

async function createOpportunity(req, res) {
  try {
    if (!req.body.title) return res.status(400).json({ error: 'Title is required.' });
    const data = { ...req.body, organizationId: req.organizationId || null, createdBy: actorId(req) };
    if (data.stage === 'WON') data.status = 'WON';
    if (data.stage === 'LOST') data.status = 'LOST';
    if (!['WON', 'LOST'].includes(data.stage)) data.status = 'OPEN';
    const opp = await Opportunity.create(data);
    res.status(201).json(opp);
  } catch (err) {
    res.status(400).json({ error: 'Could not create opportunity.', details: err.message });
  }
}

async function updateOpportunity(req, res) {
  try {
    const opp = await Opportunity.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });
    const data = { ...req.body };
    if (data.stage === 'WON') data.status = 'WON';
    else if (data.stage === 'LOST') data.status = 'LOST';
    else if (data.stage) data.status = 'OPEN';
    await opp.update(data);
    res.json(opp);
  } catch (err) {
    res.status(400).json({ error: 'Could not update opportunity.', details: err.message });
  }
}

async function deleteOpportunity(req, res) {
  try {
    const opp = await Opportunity.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });
    await opp.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete opportunity.', details: err.message });
  }
}

// ===================== PIPELINE =====================
async function getPipeline(req, res) {
  try {
    const where = withOrg(req, { status: { [Op.ne]: null } });
    if (req.query.ownerId) where.ownerId = req.query.ownerId;

    const opps = await Opportunity.findAll({
      where,
      order: [['expectedValue', 'DESC']],
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name'] },
        { model: Contact, as: 'contact', attributes: ['id', 'firstName', 'lastName'] },
      ],
    });

    const stages = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
    const pipeline = {};
    for (const s of stages) {
      const items = opps.filter((o) => o.stage === s);
      pipeline[s] = {
        items,
        count: items.length,
        totalValue: items.reduce((sum, o) => sum + parseFloat(o.expectedValue || 0), 0),
      };
    }
    res.json(pipeline);
  } catch (err) {
    res.status(500).json({ error: 'Could not load pipeline.', details: err.message });
  }
}

async function movePipelineStage(req, res) {
  try {
    const { stage } = req.body;
    if (!stage) return res.status(400).json({ error: 'Stage is required.' });
    const opp = await Opportunity.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!opp) return res.status(404).json({ error: 'Opportunity not found.' });
    const status = stage === 'WON' ? 'WON' : stage === 'LOST' ? 'LOST' : 'OPEN';
    await opp.update({ stage, status });
    if (opp.ownerId) {
      notifyUser({
        organizationId: opp.organizationId,
        userId: opp.ownerId,
        type: 'OPPORTUNITY_UPDATED',
        title: `Opportunity moved to ${stage}: ${opp.title}`,
        relatedEntityType: 'opportunity',
        relatedEntityId: opp.id,
      });
    }
    res.json(opp);
  } catch (err) {
    res.status(400).json({ error: 'Could not move opportunity.', details: err.message });
  }
}

// ===================== ACTIVITIES =====================
async function listActivities(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = withOrg(req);
    if (req.query.leadId) where.leadId = req.query.leadId;
    if (req.query.contactId) where.contactId = req.query.contactId;
    if (req.query.companyId) where.companyId = req.query.companyId;
    if (req.query.opportunityId) where.opportunityId = req.query.opportunityId;
    if (req.query.type) where.type = req.query.type;

    const { rows, count } = await Activity.findAndCountAll({
      where,
      order: [['activityDate', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Could not load activities.', details: err.message });
  }
}

async function createActivity(req, res) {
  try {
    const activity = await Activity.create({
      ...req.body,
      organizationId: req.organizationId || null,
      activityDate: req.body.activityDate || new Date(),
      createdBy: actorId(req),
    });
    res.status(201).json(activity);
  } catch (err) {
    res.status(400).json({ error: 'Could not create activity.', details: err.message });
  }
}

async function updateActivity(req, res) {
  try {
    const activity = await Activity.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!activity) return res.status(404).json({ error: 'Activity not found.' });
    await activity.update(req.body);
    res.json(activity);
  } catch (err) {
    res.status(400).json({ error: 'Could not update activity.', details: err.message });
  }
}

async function deleteActivity(req, res) {
  try {
    const activity = await Activity.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!activity) return res.status(404).json({ error: 'Activity not found.' });
    await activity.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete activity.', details: err.message });
  }
}

// ===================== TASKS =====================
async function listTasks(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = withOrg(req);
    if (req.query.status) where.status = req.query.status;
    if (req.query.priority) where.priority = req.query.priority;
    if (req.query.assignedTo) where.assignedTo = req.query.assignedTo;
    buildSearch(where, req.query.search, ['title', 'description']);

    const { rows, count } = await Task.findAndCountAll({
      where,
      order: [['dueDate', 'ASC'], ['priority', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Could not load tasks.', details: err.message });
  }
}

async function createTask(req, res) {
  try {
    if (!req.body.title) return res.status(400).json({ error: 'Title is required.' });
    const task = await Task.create({ ...req.body, organizationId: req.organizationId || null, createdBy: actorId(req) });
    if (task.assignedTo) {
      notifyUser({
        organizationId: task.organizationId,
        userId: task.assignedTo,
        type: 'TASK_ASSIGNED',
        title: `Task assigned: ${task.title}`,
        message: task.dueDate ? `Due: ${task.dueDate}` : null,
        relatedEntityType: 'task',
        relatedEntityId: task.id,
      });
    }
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: 'Could not create task.', details: err.message });
  }
}

async function updateTask(req, res) {
  try {
    const task = await Task.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    await task.update(req.body);
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: 'Could not update task.', details: err.message });
  }
}

async function deleteTask(req, res) {
  try {
    const task = await Task.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    await task.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete task.', details: err.message });
  }
}

// ===================== FOLLOW-UPS =====================
async function listFollowUps(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = withOrg(req);
    if (req.query.status) where.status = req.query.status;
    if (req.query.assignedTo) where.assignedTo = req.query.assignedTo;
    if (req.query.filter === 'today') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      where.dueDate = { [Op.between]: [start, end] };
    } else if (req.query.filter === 'overdue') {
      where.status = 'pending';
      where.dueDate = { [Op.lt]: new Date() };
    } else if (req.query.filter === 'upcoming') {
      where.status = 'pending';
      where.dueDate = { [Op.gt]: new Date() };
    }

    const { rows, count } = await FollowUp.findAndCountAll({
      where,
      order: [['dueDate', 'ASC']],
      limit,
      offset,
    });
    res.json({ data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Could not load follow-ups.', details: err.message });
  }
}

async function createFollowUp(req, res) {
  try {
    if (!req.body.title || !req.body.dueDate) {
      return res.status(400).json({ error: 'Title and due date are required.' });
    }
    const fu = await FollowUp.create({ ...req.body, organizationId: req.organizationId || null, createdBy: actorId(req) });
    if (fu.assignedTo) {
      notifyUser({
        organizationId: fu.organizationId,
        userId: fu.assignedTo,
        type: 'FOLLOWUP_DUE',
        title: `Follow-up scheduled: ${fu.title}`,
        message: fu.dueDate ? `Due: ${fu.dueDate}` : null,
        relatedEntityType: 'followup',
        relatedEntityId: fu.id,
      });
    }
    res.status(201).json(fu);
  } catch (err) {
    res.status(400).json({ error: 'Could not create follow-up.', details: err.message });
  }
}

async function updateFollowUp(req, res) {
  try {
    const fu = await FollowUp.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!fu) return res.status(404).json({ error: 'Follow-up not found.' });
    await fu.update(req.body);
    res.json(fu);
  } catch (err) {
    res.status(400).json({ error: 'Could not update follow-up.', details: err.message });
  }
}

async function deleteFollowUp(req, res) {
  try {
    const fu = await FollowUp.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!fu) return res.status(404).json({ error: 'Follow-up not found.' });
    await fu.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete follow-up.', details: err.message });
  }
}

// ===================== NOTES =====================
async function createNote(req, res) {
  try {
    if (!req.body.content) return res.status(400).json({ error: 'Content is required.' });
    const note = await Note.create({ ...req.body, organizationId: req.organizationId || null, authorId: actorId(req) });
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ error: 'Could not create note.', details: err.message });
  }
}

async function listNotes(req, res) {
  try {
    const where = withOrg(req);
    if (req.query.leadId) where.leadId = req.query.leadId;
    if (req.query.contactId) where.contactId = req.query.contactId;
    if (req.query.companyId) where.companyId = req.query.companyId;
    if (req.query.opportunityId) where.opportunityId = req.query.opportunityId;
    if (req.query.ticketId) where.ticketId = req.query.ticketId;
    const notes = await Note.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Could not load notes.', details: err.message });
  }
}

async function deleteNote(req, res) {
  try {
    const note = await Note.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    await note.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete note.', details: err.message });
  }
}

// ===================== TICKETS =====================
async function generateTicketNumber() {
  const prefix = 'TKT';
  const count = await Ticket.count();
  return `${prefix}-${String(count + 1).padStart(6, '0')}`;
}

async function listTickets(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = withOrg(req);
    if (req.query.status) where.status = req.query.status;
    if (req.query.priority) where.priority = req.query.priority;
    if (req.query.assignedTo) where.assignedTo = req.query.assignedTo;
    buildSearch(where, req.query.search, ['ticketNumber', 'subject', 'customerName', 'customerEmail']);

    const { rows, count } = await Ticket.findAndCountAll({
      where,
      order: [['updatedAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Could not load tickets.', details: err.message });
  }
}

async function getTicket(req, res) {
  try {
    const ticket = await Ticket.findOne({ where: withOrg(req, { id: req.params.id }),
      include: [{ model: TicketComment, as: 'comments' }],
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Could not load ticket.', details: err.message });
  }
}

async function createTicket(req, res) {
  try {
    if (!req.body.subject) return res.status(400).json({ error: 'Subject is required.' });
    const ticketNumber = await generateTicketNumber();
    const ticket = await Ticket.create({
      ...req.body,
      organizationId: req.organizationId || null,
      ticketNumber,
      createdBy: actorId(req),
    });
    if (ticket.assignedTo) {
      notifyUser({
        organizationId: ticket.organizationId,
        userId: ticket.assignedTo,
        type: 'TICKET_ASSIGNED',
        title: `Ticket assigned: ${ticket.ticketNumber} — ${ticket.subject}`,
        relatedEntityType: 'ticket',
        relatedEntityId: ticket.id,
      });
    }
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ error: 'Could not create ticket.', details: err.message });
  }
}

async function updateTicket(req, res) {
  try {
    const ticket = await Ticket.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    await ticket.update(req.body);
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: 'Could not update ticket.', details: err.message });
  }
}

async function addTicketComment(req, res) {
  try {
    const ticket = await Ticket.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    if (!req.body.content) return res.status(400).json({ error: 'Content is required.' });
    const comment = await TicketComment.create({
      ticketId: ticket.id,
      organizationId: req.organizationId || ticket.organizationId || null,
      content: req.body.content,
      isInternal: !!req.body.isInternal,
      authorId: actorId(req),
      authorName: req.user?.name || req.admin?.name || req.admin?.email || 'User',
    });
    await ticket.update({ updatedAt: new Date() });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: 'Could not add comment.', details: err.message });
  }
}

async function deleteTicket(req, res) {
  try {
    const ticket = await Ticket.findOne({ where: withOrg(req, { id: req.params.id }) });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    await TicketComment.destroy({ where: { ticketId: ticket.id } });
    await ticket.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete ticket.', details: err.message });
  }
}

// ===================== SEARCH =====================
async function globalSearch(req, res) {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) return res.json({ leads: [], contacts: [], companies: [], opportunities: [], tickets: [] });
    const term = `%${q}%`;

    const o = orgScope(req);
    const [leads, contacts, companies, opportunities, tickets] = await Promise.all([
      Lead.findAll({
        where: { ...o, [Op.or]: [{ name: { [Op.like]: term } }, { email: { [Op.like]: term } }, { company: { [Op.like]: term } }] },
        limit: 10,
        attributes: ['id', 'name', 'email', 'company', 'status'],
      }),
      Contact.findAll({
        where: { ...o, [Op.or]: [{ firstName: { [Op.like]: term } }, { lastName: { [Op.like]: term } }, { email: { [Op.like]: term } }] },
        limit: 10,
        attributes: ['id', 'firstName', 'lastName', 'email', 'companyName'],
      }),
      Company.findAll({
        where: { [Op.or]: [{ name: { [Op.like]: term } }, { email: { [Op.like]: term } }] },
        limit: 10,
        attributes: ['id', 'name', 'email', 'industry'],
      }),
      Opportunity.findAll({
        where: { title: { [Op.like]: term } },
        limit: 10,
        attributes: ['id', 'title', 'stage', 'status', 'expectedValue'],
      }),
      Ticket.findAll({
        where: { [Op.or]: [{ ticketNumber: { [Op.like]: term } }, { subject: { [Op.like]: term } }, { customerName: { [Op.like]: term } }] },
        limit: 10,
        attributes: ['id', 'ticketNumber', 'subject', 'status', 'priority'],
      }),
    ]);

    res.json({ leads, contacts, companies, opportunities, tickets });
  } catch (err) {
    res.status(500).json({ error: 'Search failed.', details: err.message });
  }
}

// ===================== REPORTS =====================
/** Build the last `months` calendar-month buckets as {key: 'YYYY-MM', label: 'Mon'} in order. */
function lastMonthBuckets(months = 6) {
  const now = new Date();
  const out = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({ key, label: d.toLocaleString('en-US', { month: 'short' }) });
  }
  return out;
}

async function reports(req, res) {
  try {
    const o = orgScope(req);
    const buckets = lastMonthBuckets(6);
    const since = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);

    const [
      leadsByStatus,
      leadsBySource,
      oppsByStage,
      wonVsLost,
      taskStats,
      ticketStats,
      followUpStats,
      leadsByMonth,
      revenueByMonth,
    ] = await Promise.all([
      Lead.findAll({ where: o, attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),
      Lead.findAll({ where: o, attributes: ['source', [fn('COUNT', col('id')), 'count']], group: ['source'], raw: true }),
      Opportunity.findAll({
        where: o,
        attributes: ['stage', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('expectedValue')), 'totalValue']],
        group: ['stage'],
        raw: true,
      }),
      Opportunity.findAll({
        where: o,
        attributes: ['status', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('expectedValue')), 'totalValue']],
        group: ['status'],
        raw: true,
      }),
      Task.findAll({ where: o, attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),
      Ticket.findAll({ where: o, attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),
      FollowUp.findAll({ where: o, attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true }),
      // New leads per month (last 6 months) — drives the leads trend line chart.
      Lead.findAll({
        where: { ...o, createdAt: { [Op.gte]: since } },
        attributes: [[fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'], [fn('COUNT', col('id')), 'count']],
        group: ['month'],
        raw: true,
      }),
      // Won revenue per month (last 6 months, by last-updated date as a proxy for close date).
      Opportunity.findAll({
        where: { ...o, status: 'WON', updatedAt: { [Op.gte]: since } },
        attributes: [[fn('DATE_FORMAT', col('updatedAt'), '%Y-%m'), 'month'], [fn('SUM', col('expectedValue')), 'revenue']],
        group: ['month'],
        raw: true,
      }),
    ]);

    const leadsMap = Object.fromEntries(leadsByMonth.map((r) => [r.month, Number(r.count)]));
    const revenueMap = Object.fromEntries(revenueByMonth.map((r) => [r.month, Number(r.revenue || 0)]));
    const monthlyTrend = buckets.map((b) => ({
      month: b.label,
      newLeads: leadsMap[b.key] || 0,
      wonRevenue: revenueMap[b.key] || 0,
    }));

    res.json({
      leadsByStatus,
      leadsBySource,
      oppsByStage,
      wonVsLost,
      taskStats,
      ticketStats,
      followUpStats,
      monthlyTrend,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not load reports.', details: err.message });
  }
}

// ===================== EXPORT =====================
async function exportData(req, res) {
  try {
    const type = req.params.type;
    const o = orgScope(req);
    let rows = [];
    let headers = [];

    if (type === 'leads') {
      rows = await Lead.findAll({ where: o, order: [['createdAt', 'DESC']], raw: true });
      headers = ['id', 'name', 'company', 'email', 'phone', 'status', 'priority', 'source', 'industry', 'requirement', 'createdAt'];
    } else if (type === 'contacts') {
      rows = await Contact.findAll({ where: o, order: [['createdAt', 'DESC']], raw: true });
      headers = ['id', 'firstName', 'lastName', 'email', 'phone', 'jobTitle', 'companyName', 'city', 'country', 'createdAt'];
    } else if (type === 'companies') {
      rows = await Company.findAll({ where: o, order: [['name', 'ASC']], raw: true });
      headers = ['id', 'name', 'industry', 'website', 'email', 'phone', 'city', 'country', 'status', 'createdAt'];
    } else if (type === 'opportunities') {
      rows = await Opportunity.findAll({ where: o, order: [['createdAt', 'DESC']], raw: true });
      headers = ['id', 'title', 'stage', 'status', 'expectedValue', 'probability', 'expectedCloseDate', 'createdAt'];
    } else if (type === 'tasks') {
      rows = await Task.findAll({ where: o, order: [['dueDate', 'ASC']], raw: true });
      headers = ['id', 'title', 'status', 'priority', 'dueDate', 'createdAt'];
    } else if (type === 'tickets') {
      rows = await Ticket.findAll({ where: o, order: [['createdAt', 'DESC']], raw: true });
      headers = ['id', 'ticketNumber', 'subject', 'status', 'priority', 'customerName', 'customerEmail', 'createdAt'];
    } else {
      return res.status(400).json({ error: 'Invalid export type.' });
    }

    const escape = (v) => {
      if (v == null) return '';
      const s = String(v);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const lines = [headers.join(',')];
    for (const row of rows) {
      lines.push(headers.map((h) => escape(row[h])).join(','));
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="crm-${type}-${Date.now()}.csv"`);
    res.send(lines.join('\n'));
  } catch (err) {
    res.status(500).json({ error: 'Export failed.', details: err.message });
  }
}

// ===================== CONVERT CONTACT SUBMISSION → LEAD =====================
async function convertSubmissionToLead(req, res) {
  try {
    const ContactSubmission = require('../models/ContactSubmission');
    const submission = await ContactSubmission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found.' });

    // Duplicate check
    let existing = null;
    if (submission.email) {
      existing = await Lead.findOne({ where: withOrg(req, { email: submission.email }) });
    }
    if (!existing && submission.phone) {
      existing = await Lead.findOne({ where: withOrg(req, { phone: submission.phone }) });
    }

    if (existing) {
      await submission.update({ status: 'contacted' });
      return res.json({ lead: existing, converted: false, message: 'Linked to existing lead.' });
    }

    const lead = await Lead.create({
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      company: submission.company,
      requirement: submission.message,
      source: 'website',
      status: 'NEW',
      priority: 'MEDIUM',
      industry: submission.interestedIn || null,
      contactSubmissionId: submission.id,
      organizationId: req.organizationId || null,
      createdBy: actorId(req),
    });

    await submission.update({ status: 'contacted' });
    res.status(201).json({ lead, converted: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not convert submission.', details: err.message });
  }
}

module.exports = {
  dashboard,
  listLeads, getLead, createLead, updateLead, deleteLead,
  listContacts, getContact, createContact, updateContact, deleteContact,
  listCompanies, getCompany, createCompany, updateCompany, deleteCompany,
  listOpportunities, getOpportunity, createOpportunity, updateOpportunity, deleteOpportunity,
  getPipeline, movePipelineStage,
  listActivities, createActivity, updateActivity, deleteActivity,
  listTasks, createTask, updateTask, deleteTask,
  listFollowUps, createFollowUp, updateFollowUp, deleteFollowUp,
  createNote, listNotes, deleteNote,
  listTickets, getTicket, createTicket, updateTicket, addTicketComment, deleteTicket,
  globalSearch, reports, exportData,
  convertSubmissionToLead,
};
