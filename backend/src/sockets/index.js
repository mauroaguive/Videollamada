const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const roomHandler = require('./roomHandler');

function setupSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: env.frontendUrl,
      credentials: true,
    },
  });

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const patientToken = socket.handshake.auth.patientToken;

    if (token) {
      // Professional/admin auth via JWT
      try {
        const decoded = jwt.verify(token, env.jwt.secret);
        socket.user = decoded;
        socket.userType = 'professional';
        return next();
      } catch (err) {
        return next(new Error('Token de autenticación inválido'));
      }
    }

    if (patientToken) {
      // Patient auth via appointment token - validated in room handler
      socket.patientToken = patientToken;
      socket.userType = 'patient';
      return next();
    }

    return next(new Error('Autenticación requerida'));
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (${socket.userType})`);
    roomHandler(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

module.exports = setupSockets;
