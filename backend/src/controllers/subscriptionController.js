const { SubscriptionPlan, Subscription, Organization } = require('../models/platform/platformAssociations');
const { recordAudit } = require('../utils/audit');

// ------------------------------------------------------------------ plans
async function listPlans(req, res) {
  try {
    res.json(await SubscriptionPlan.findAll({ order: [['price', 'ASC']] }));
  } catch (err) {
    res.status(500).json({ error: 'Failed to list plans.', details: err.message });
  }
}

async function createPlan(req, res) {
  try {
    const { name, description, price, billingCycle, features, limits } = req.body;
    if (!name || price === undefined) return res.status(400).json({ error: 'name and price are required.' });
    const plan = await SubscriptionPlan.create({ name, description, price, billingCycle, features, limits });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create plan.', details: err.message });
  }
}

async function updatePlan(req, res) {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found.' });
    ['name', 'description', 'price', 'billingCycle', 'features', 'limits', 'status'].forEach((f) => {
      if (req.body[f] !== undefined) plan[f] = req.body[f];
    });
    await plan.save();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update plan.', details: err.message });
  }
}

// ------------------------------------------------------------ subscriptions
async function getForOrganization(req, res) {
  try {
    const sub = await Subscription.findOne({
      where: { organizationId: req.params.organizationId },
      include: [{ association: 'plan' }],
      order: [['createdAt', 'DESC']],
    });
    if (!sub) return res.status(404).json({ error: 'No subscription found for this organization.' });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load subscription.', details: err.message });
  }
}

// Assigns/changes an organization's plan. No payment gateway is wired up
// (none existed in the project) — this is the point a webhook from a real
// gateway (Stripe/Razorpay/etc.) would call into to activate a paid plan.
async function assignPlan(req, res) {
  try {
    const { planId, status, endDate, autoRenew } = req.body;
    const organizationId = Number(req.params.organizationId);

    const [org, plan] = await Promise.all([
      Organization.findByPk(organizationId),
      SubscriptionPlan.findByPk(planId),
    ]);
    if (!org) return res.status(404).json({ error: 'Organization not found.' });
    if (!plan) return res.status(404).json({ error: 'Plan not found.' });

    const sub = await Subscription.create({
      organizationId,
      planId,
      startDate: new Date(),
      endDate: endDate || null,
      status: status || 'ACTIVE',
      autoRenew: Boolean(autoRenew),
    });

    await recordAudit({ req, organizationId, action: 'SUBSCRIPTION_CHANGED', entityType: 'Subscription', entityId: sub.id, metadata: { planId, status: sub.status } });
    res.status(201).json(sub);
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign plan.', details: err.message });
  }
}

module.exports = { listPlans, createPlan, updatePlan, getForOrganization, assignPlan };
