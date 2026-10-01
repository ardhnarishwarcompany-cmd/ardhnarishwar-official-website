const slugify = require('slugify');
const Service = require('../models/Service');

// liveStatsApiKey is a secret used only for our own server-to-server call to
// the real product's API (see getLiveStats below) — it must never appear in
// a public response.
const PUBLIC_EXCLUDE = ['liveStatsApiKey'];

// Public: list published services (admin panel passes ?all=true to see everything)
async function list(req, res) {
  try {
    const where = req.query.all === 'true' ? {} : { isPublished: true };
    const services = await Service.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
      attributes: { exclude: PUBLIC_EXCLUDE },
    });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Could not load services.', details: err.message });
  }
}

async function getBySlug(req, res) {
  try {
    const service = await Service.findOne({
      where: { slug: req.params.slug },
      attributes: { exclude: PUBLIC_EXCLUDE },
    });
    if (!service) return res.status(404).json({ error: 'Service not found.' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: 'Could not load service.', details: err.message });
  }
}

// Public: proxies to the real product's own "dashboard summary" API (see the
// liveStatsUrl comment in models/Service.js for the expected shape), so the
// demo page can show real numbers instead of hardcoded ones. The fetch runs
// server-side so any liveStatsApiKey secret never reaches the browser, and a
// slow/broken upstream can't hang the request forever.
async function getLiveStats(req, res) {
  try {
    const service = await Service.findOne({ where: { slug: req.params.slug } });
    if (!service) return res.status(404).json({ error: 'Service not found.' });
    if (!service.liveStatsUrl) {
      return res.status(404).json({ error: 'No live stats source configured for this service.' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    let upstream;
    try {
      upstream = await fetch(service.liveStatsUrl, {
        signal: controller.signal,
        headers: service.liveStatsApiKey
          ? { Authorization: `Bearer ${service.liveStatsApiKey}` }
          : undefined,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!upstream.ok) {
      return res.status(502).json({ error: `Live stats source returned ${upstream.status}.` });
    }

    const data = await upstream.json();
    const stats = Array.isArray(data?.stats) ? data.stats : [];
    const chart = data?.chart && Array.isArray(data.chart.data) ? data.chart : null;
    if (stats.length === 0 && !chart) {
      return res.status(502).json({ error: 'Live stats source returned an unexpected shape.' });
    }

    res.json({ stats, chart, source: 'live', fetchedAt: new Date().toISOString() });
  } catch (err) {
    res.status(502).json({ error: 'Could not reach live stats source.', details: err.message });
  }
}

// Admin only from here down
async function create(req, res) {
  try {
    const body = { ...req.body };
    if (!body.slug && body.title) {
      body.slug = slugify(body.title, { lower: true, strict: true });
    }
    const service = await Service.create(body);
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: 'Could not create service.', details: err.message });
  }
}

async function update(req, res) {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found.' });

    const body = { ...req.body };
    if (body.title && !body.slug) {
      body.slug = slugify(body.title, { lower: true, strict: true });
    }
    await service.update(body);
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: 'Could not update service.', details: err.message });
  }
}

async function remove(req, res) {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found.' });
    await service.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete service.', details: err.message });
  }
}

module.exports = { list, getBySlug, getLiveStats, create, update, remove };