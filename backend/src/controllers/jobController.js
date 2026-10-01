const slugify = require('slugify');
const JobOpening = require('../models/JobOpening');

async function list(req, res) {
  try {
    const where = req.query.all === 'true' ? {} : { isPublished: true };
    const jobs = await JobOpening.findAll({ where, order: [['postedAt', 'DESC'], ['createdAt', 'DESC']] });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Could not load job openings.', details: err.message });
  }
}

async function getBySlug(req, res) {
  try {
    const job = await JobOpening.findOne({ where: { slug: req.params.slug } });
    if (!job) return res.status(404).json({ error: 'Job opening not found.' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Could not load job opening.', details: err.message });
  }
}

async function create(req, res) {
  try {
    const body = { ...req.body };
    if (!body.slug && body.title) {
      body.slug = slugify(body.title, { lower: true, strict: true });
    }
    if (body.isPublished !== false && !body.postedAt) {
      body.postedAt = new Date();
    }
    const job = await JobOpening.create(body);
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: 'Could not create job opening.', details: err.message });
  }
}

async function update(req, res) {
  try {
    const job = await JobOpening.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job opening not found.' });
    const body = { ...req.body };
    if (body.title && !body.slug) {
      body.slug = slugify(body.title, { lower: true, strict: true });
    }
    await job.update(body);
    res.json(job);
  } catch (err) {
    res.status(400).json({ error: 'Could not update job opening.', details: err.message });
  }
}

async function remove(req, res) {
  try {
    const job = await JobOpening.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job opening not found.' });
    await job.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete job opening.', details: err.message });
  }
}

module.exports = { list, getBySlug, create, update, remove };
