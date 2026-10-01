const SiteSetting = require('../models/SiteSetting');

const ALLOWED_FIELDS = [
  'jobPortalUrl', 'attendanceUrl', 'hrmsUrl',
  'contactEmail', 'contactPhone', 'officeAddress',
  'linkedinUrl', 'twitterUrl', 'facebookUrl', 'instagramUrl', 'youtubeUrl',
];

// Public: read the single settings row (creates an empty one on first call)
async function get(req, res) {
  try {
    const [settings] = await SiteSetting.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Could not load settings.', details: err.message });
  }
}

// Admin only: update any subset of the allowed fields
async function update(req, res) {
  try {
    const [settings] = await SiteSetting.findOrCreate({ where: { id: 1 }, defaults: { id: 1 } });
    const body = {};
    for (const field of ALLOWED_FIELDS) {
      if (field in req.body) body[field] = req.body[field] || null;
    }
    await settings.update(body);
    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: 'Could not update settings.', details: err.message });
  }
}

module.exports = { get, update };