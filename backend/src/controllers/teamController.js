const TeamMember = require('../models/TeamMember');

async function list(req, res) {
  try {
    const where = req.query.all === 'true' ? {} : { isPublished: true };
    const members = await TeamMember.findAll({ where, order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']] });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Could not load team members.', details: err.message });
  }
}

async function create(req, res) {
  try {
    const member = await TeamMember.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ error: 'Could not create team member.', details: err.message });
  }
}

async function update(req, res) {
  try {
    const member = await TeamMember.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Team member not found.' });
    await member.update(req.body);
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: 'Could not update team member.', details: err.message });
  }
}

async function remove(req, res) {
  try {
    const member = await TeamMember.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: 'Team member not found.' });
    await member.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete team member.', details: err.message });
  }
}

module.exports = { list, create, update, remove };
