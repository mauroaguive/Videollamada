const auditService = require('../services/auditService');

// rooms Map: roomId -> { participants: Map<socketId, { role, socketId }>, appointmentId }
const rooms = new Map();

/**
 * Get an array of participant role objects for a given room.
 * @param {string} roomId
 * @returns {Array<{ role: string, socketId: string }>}
 */
function getParticipantList(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.participants.values());
}

/**
 * Remove a socket from a specific room and notify remaining participants.
 * Cleans up the room if it becomes empty.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 * @param {string} roomId
 */
function removeFromRoom(io, socket, roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const participant = room.participants.get(socket.id);
  if (!participant) return;

  const { role } = participant;
  room.participants.delete(socket.id);
  socket.leave(roomId);

  // Notify remaining participants
  socket.to(roomId).emit('room:participant-left', { role });

  // Clean up empty rooms
  if (room.participants.size === 0) {
    rooms.delete(roomId);
  }

  // Audit log (fire-and-forget)
  try {
    auditService.log({
      appointmentId: room.appointmentId || roomId,
      actorType: role === 'professional' ? 'PROFESIONAL' : 'PACIENTE',
      actorId: socket.user ? String(socket.user.id || socket.user.sub) : socket.id,
      action: 'ROOM_LEAVE',
      ipAddress: socket.handshake.address,
      userAgent: socket.handshake.headers ? socket.handshake.headers['user-agent'] : null,
      metadata: { roomId, socketId: socket.id, role },
    }).catch((err) => {
      console.error('Audit log error (room:leave):', err.message);
    });
  } catch (err) {
    console.error('Audit log error (room:leave):', err.message);
  }
}

/**
 * Main room handler — registers all socket events for room management
 * and WebRTC signaling.
 *
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
function roomHandler(io, socket) {
  // ──────────────────────────────────────────────
  // room:join  { roomId, role }
  // ──────────────────────────────────────────────
  socket.on('room:join', ({ roomId, role }) => {
    try {
      if (!roomId || !role) {
        socket.emit('room:error', { message: 'roomId y role son requeridos' });
        return;
      }

      if (!['professional', 'patient'].includes(role)) {
        socket.emit('room:error', { message: 'Rol inválido. Debe ser "professional" o "patient"' });
        return;
      }

      // Create room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          participants: new Map(),
          appointmentId: roomId,
        });
      }

      const room = rooms.get(roomId);

      // Check if room is full (max 2 participants)
      if (room.participants.size >= 2) {
        socket.emit('room:error', { message: 'La sala está llena' });
        return;
      }

      // Check if a participant with the same role already exists
      const existingRoles = Array.from(room.participants.values()).map((p) => p.role);
      if (existingRoles.includes(role)) {
        socket.emit('room:error', {
          message: `Ya hay un participante con el rol "${role}" en esta sala`,
        });
        return;
      }

      // Join the Socket.IO room
      socket.join(roomId);

      // Add participant to room state
      room.participants.set(socket.id, { role, socketId: socket.id });

      // Emit to the joining socket
      const participants = getParticipantList(roomId).map((p) => p.role);
      socket.emit('room:joined', { participants });

      // Notify other participants in the room
      socket.to(roomId).emit('room:participant-joined', { role });

      // Audit log (fire-and-forget)
      try {
        auditService.log({
          appointmentId: room.appointmentId || roomId,
          actorType: role === 'professional' ? 'PROFESIONAL' : 'PACIENTE',
          actorId: socket.user ? String(socket.user.id || socket.user.sub) : socket.id,
          action: 'ROOM_JOIN',
          ipAddress: socket.handshake.address,
          userAgent: socket.handshake.headers ? socket.handshake.headers['user-agent'] : null,
          metadata: { roomId, socketId: socket.id, role },
        }).catch((err) => {
          console.error('Audit log error (room:join):', err.message);
        });
      } catch (err) {
        console.error('Audit log error (room:join):', err.message);
      }
    } catch (err) {
      console.error('Error in room:join handler:', err);
      socket.emit('room:error', { message: 'Error interno al unirse a la sala' });
    }
  });

  // ──────────────────────────────────────────────
  // room:leave  { roomId }
  // ──────────────────────────────────────────────
  socket.on('room:leave', ({ roomId }) => {
    try {
      if (!roomId) {
        socket.emit('room:error', { message: 'roomId es requerido' });
        return;
      }

      removeFromRoom(io, socket, roomId);
    } catch (err) {
      console.error('Error in room:leave handler:', err);
    }
  });

  // ──────────────────────────────────────────────
  // WebRTC signaling: offer
  // ──────────────────────────────────────────────
  socket.on('webrtc:offer', ({ roomId, sdp }) => {
    try {
      if (!roomId || !sdp) return;
      socket.to(roomId).emit('webrtc:offer', { sdp });
    } catch (err) {
      console.error('Error in webrtc:offer handler:', err);
    }
  });

  // ──────────────────────────────────────────────
  // WebRTC signaling: answer
  // ──────────────────────────────────────────────
  socket.on('webrtc:answer', ({ roomId, sdp }) => {
    try {
      if (!roomId || !sdp) return;
      socket.to(roomId).emit('webrtc:answer', { sdp });
    } catch (err) {
      console.error('Error in webrtc:answer handler:', err);
    }
  });

  // ──────────────────────────────────────────────
  // WebRTC signaling: ice-candidate
  // ──────────────────────────────────────────────
  socket.on('webrtc:ice-candidate', ({ roomId, candidate }) => {
    try {
      if (!roomId || !candidate) return;
      socket.to(roomId).emit('webrtc:ice-candidate', { candidate });
    } catch (err) {
      console.error('Error in webrtc:ice-candidate handler:', err);
    }
  });

  // ──────────────────────────────────────────────
  // call:end  { roomId }  — only professional can end
  // ──────────────────────────────────────────────
  socket.on('call:end', ({ roomId }) => {
    try {
      if (!roomId) {
        socket.emit('room:error', { message: 'roomId es requerido' });
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('room:error', { message: 'Sala no encontrada' });
        return;
      }

      // Only the professional can end the call
      const participant = room.participants.get(socket.id);
      if (!participant || participant.role !== 'professional') {
        socket.emit('room:error', { message: 'Solo el profesional puede finalizar la llamada' });
        return;
      }

      // Notify everyone in the room (including the sender)
      io.to(roomId).emit('call:ended', { roomId });

      // Audit log (fire-and-forget)
      try {
        auditService.log({
          appointmentId: room.appointmentId || roomId,
          actorType: 'PROFESIONAL',
          actorId: socket.user ? String(socket.user.id || socket.user.sub) : socket.id,
          action: 'CALL_END',
          ipAddress: socket.handshake.address,
          userAgent: socket.handshake.headers ? socket.handshake.headers['user-agent'] : null,
          metadata: { roomId, socketId: socket.id },
        }).catch((err) => {
          console.error('Audit log error (call:end):', err.message);
        });
      } catch (err) {
        console.error('Audit log error (call:end):', err.message);
      }

      // Remove all participants and clean up room
      for (const [socketId] of room.participants) {
        const memberSocket = io.sockets.sockets.get(socketId);
        if (memberSocket) {
          memberSocket.leave(roomId);
        }
      }
      rooms.delete(roomId);
    } catch (err) {
      console.error('Error in call:end handler:', err);
      socket.emit('room:error', { message: 'Error interno al finalizar la llamada' });
    }
  });

  // ──────────────────────────────────────────────
  // disconnect — clean up all rooms this socket was in
  // ──────────────────────────────────────────────
  socket.on('disconnect', () => {
    try {
      // Iterate over all rooms and remove this socket
      for (const [roomId, room] of rooms) {
        if (room.participants.has(socket.id)) {
          removeFromRoom(io, socket, roomId);
        }
      }
    } catch (err) {
      console.error('Error in disconnect handler:', err);
    }
  });
}

module.exports = roomHandler;
