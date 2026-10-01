const { Notification } = require('../models/platform/platformAssociations');

async function list(req, res) {
  try {
    const where = { userId: req.user.id };
    if (req.query.unread === 'true') where.isRead = false;
    const notifications = await Notification.findAll({ where, order: [['createdAt', 'DESC']], limit: 100 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load notifications.', details: err.message });
  }
}

async function markRead(req, res) {
  try {
    const notification = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!notification) return res.status(404).json({ error: 'Notification not found.' });
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification.', details: err.message });
  }
}

async function markAllRead(req, res) {
  try {
    await Notification.update({ isRead: true, readAt: new Date() }, { where: { userId: req.user.id, isRead: false } });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications.', details: err.message });
  }
}

module.exports = { list, markRead, markAllRead };
