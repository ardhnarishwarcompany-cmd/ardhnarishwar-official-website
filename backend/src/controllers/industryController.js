const slugify = require('slugify');
const Industry = require('../models/Industry');

async function list(req, res) {
  try {
    const where = req.query.all === 'true' ? {} : { isPublished: true };
    const industries = await Industry.findAll({ where, order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']] });
    res.json(industries);
  } catch (err) {
    res.status(500).json({ error: 'Could not load industries.', details: err.message });
  }
}

async function getBySlug(req, res) {
  try {
    const industry = await Industry.findOne({ where: { slug: req.params.slug } });
    if (!industry) return res.status(404).json({ error: 'Industry not found.' });
    res.json(industry);
  } catch (err) {
    res.status(500).json({ error: 'Could not load industry.', details: err.message });
  }
}

async function create(req, res) {
  try {
    const body = { ...req.body };
    if (!body.slug && body.name) {
      body.slug = slugify(body.name, { lower: true, strict: true });
    }
    const industry = await Industry.create(body);
    res.status(201).json(industry);
  } catch (err) {
    res.status(400).json({ error: 'Could not create industry.', details: err.message });
  }
}

async function update(req, res) {
  try {
    const industry = await Industry.findByPk(req.params.id);
    if (!industry) return res.status(404).json({ error: 'Industry not found.' });
    const body = { ...req.body };
    if (body.name && !body.slug) {
      body.slug = slugify(body.name, { lower: true, strict: true });
    }
    await industry.update(body);
    res.json(industry);
  } catch (err) {
    res.status(400).json({ error: 'Could not update industry.', details: err.message });
  }
}

async function remove(req, res) {
  try {
    const industry = await Industry.findByPk(req.params.id);
    if (!industry) return res.status(404).json({ error: 'Industry not found.' });
    await industry.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete industry.', details: err.message });
  }
}

module.exports = { list, getBySlug, create, update, remove };
