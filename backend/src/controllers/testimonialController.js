const Testimonial = require('../models/Testimonial');

async function list(req, res) {
  try {
    const where = req.query.all === 'true' ? {} : { isPublished: true };
    const items = await Testimonial.findAll({ where, order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Could not load testimonials.', details: err.message });
  }
}

async function create(req, res) {
  try {
    const item = await Testimonial.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: 'Could not create testimonial.', details: err.message });
  }
}

async function update(req, res) {
  try {
    const item = await Testimonial.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Testimonial not found.' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Could not update testimonial.', details: err.message });
  }
}

async function remove(req, res) {
  try {
    const item = await Testimonial.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Testimonial not found.' });
    await item.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete testimonial.', details: err.message });
  }
}

module.exports = { list, create, update, remove };
