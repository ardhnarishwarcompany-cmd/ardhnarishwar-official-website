const jwt = require('jsonwebtoken');

// Singleton Socket.IO server instance. init() is called once from server.js
// with the underlying http.Server; every other file (e.g. utils/notify.js)
// just calls getIO() to emit events, so there is no circular-require issue.
let io = null;

function init(httpServer) {
  const { Server } = require('socket.io');

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  // Auth handshake: client must connect with { auth: { token: <platform access token> } }
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token provided.'));
      const payload = jwt.verify(token, process.env.PLATFORM_JWT_SECRET || process.env.JWT_SECRET);
      if (payload.type !== 'access') return next(new Error('Invalid token type.'));
      socket.userId = payload.id;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    // Personal room for direct-to-user events (notifications, etc.)
    socket.join(`user:${socket.userId}`);

    // Client may additionally ask to join its organization room, e.g. for
    // future cross-user CRM events (lead updated by a teammate, etc.)
    socket.on('join-org', (organizationId) => {
      if (organizationId) socket.join(`org:${organizationId}`);
    });

    socket.on('disconnect', () => {
      // no-op — rooms are cleaned up automatically by socket.io
    });
  });

  console.log('Socket.io initialized.');
  return io;
}

function getIO() {
  return io; // may be null if init() hasn't run yet (e.g. during tests) — callers must guard
}

// Convenience helpers used by utils/notify.js and CRM controllers.
function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
}

function emitToOrganization(organizationId, event, payload) {
  if (!io || !organizationId) return;
  io.to(`org:${organizationId}`).emit(event, payload);
}

module.exports = { init, getIO, emitToUser, emitToOrganization };
