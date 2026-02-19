const crypto = require('crypto');
const dayjs = require('dayjs');
const tokenModel = require('../models/tokenModel');

const tokenService = {
  async generate(appointmentId, scheduledAt, durationMinutes) {
    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = dayjs(scheduledAt)
      .add(durationMinutes, 'minute')
      .add(60, 'minute') // 60 min buffer
      .format('YYYY-MM-DD HH:mm:ss');

    await tokenModel.create({
      appointment_id: appointmentId,
      token,
      expires_at: expiresAt,
    });

    return token;
  },

  async validate(tokenString) {
    const record = await tokenModel.findByToken(tokenString);

    if (!record) {
      const err = new Error('Token no encontrado');
      err.status = 404;
      throw err;
    }

    if (record.is_revoked) {
      const err = new Error('El enlace ha sido revocado');
      err.status = 403;
      throw err;
    }

    const now = dayjs();
    const expiresAt = dayjs(record.expires_at);
    if (now.isAfter(expiresAt)) {
      const err = new Error('El enlace ha expirado');
      err.status = 410;
      throw err;
    }

    await tokenModel.incrementUsedCount(record.id);

    return record;
  },

  async revoke(appointmentId) {
    await tokenModel.revoke(appointmentId);
  },

  async regenerate(appointmentId, scheduledAt, durationMinutes) {
    await tokenModel.deleteByAppointmentId(appointmentId);
    return this.generate(appointmentId, scheduledAt, durationMinutes);
  },
};

module.exports = tokenService;
