const { Notification } = require('../models/platform/platformAssociations');
const { emitToUser } = require('./socket');

async function notifyUser({ organizationId = null, userId, type, title, message = null, relatedEntityType = null, relatedEntityId = null }) {
  try {
    const notification = await Notification.create({ organizationId, userId, type, title, message, relatedEntityType, relatedEntityId });
    // Push it live to the user's browser if they're connected — the portal
    // notification bell also polls every 60s as a fallback for when the
    // socket isn't connected (page just loaded, network hiccup, etc.).
    emitToUser(userId, 'notification:new', notification);
    return notification;
  } catch (err) {
    console.error('Notification write failed:', err.message);
    return null;
  }
}

module.exports = { notifyUser };
