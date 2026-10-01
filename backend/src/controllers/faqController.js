const FaqItem = require('../models/FaqItem');

async function list(req, res) {
  try {
    const where = req.query.all === 'true' ? {} : { isPublished: true };
    const items = await FaqItem.findAll({ where, order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Could not load FAQs.', details: err.message });
  }
}

async function create(req, res) {
  try {
    const item = await FaqItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: 'Could not create FAQ.', details: err.message });
  }
}

async function update(req, res) {
  try {
    const item = await FaqItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'FAQ not found.' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Could not update FAQ.', details: err.message });
  }
}

async function remove(req, res) {
  try {
    const item = await FaqItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'FAQ not found.' });
    await item.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete FAQ.', details: err.message });
  }
}

module.exports = { list, create, update, remove };
