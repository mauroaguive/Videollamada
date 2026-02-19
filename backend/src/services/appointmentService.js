const appointmentModel = require('../models/appointmentModel');
const tokenService = require('./tokenService');
const emailService = require('./emailService');

const VALID_TRANSITIONS = {
  PROGRAMADA: ['EN_SALA', 'CANCELADA', 'NO_ASISTE'],
  EN_SALA: ['FINALIZADA'],
  FINALIZADA: [],
  CANCELADA: [],
  NO_ASISTE: [],
};

function validateTransition(currentStatus, newStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    const err = new Error(
      `No se puede cambiar de "${currentStatus}" a "${newStatus}"`
    );
    err.status = 400;
    throw err;
  }
}

const appointmentService = {
  async getAll(filters) {
    return appointmentModel.findAll(filters);
  },

  async getById(id) {
    const appointment = await appointmentModel.findById(id);
    if (!appointment) {
      const err = new Error('Cita no encontrada');
      err.status = 404;
      throw err;
    }
    return appointment;
  },

  async create(data, userId) {
    const appointmentData = { ...data, created_by: userId };
    const appointment = await appointmentModel.create(appointmentData);

    try {
      const token = await tokenService.generate(
        appointment.id,
        appointment.scheduled_at,
        appointment.duration_minutes
      );
      await emailService.sendAppointmentLink(appointment, token);
    } catch (err) {
      console.error('Error generating token or sending email:', err.message);
    }

    return appointment;
  },

  async update(id, data) {
    await this.getById(id);
    return appointmentModel.update(id, data);
  },

  async cancel(id) {
    const appointment = await this.getById(id);
    validateTransition(appointment.status, 'CANCELADA');
    await tokenService.revoke(id);
    return appointmentModel.updateStatus(id, 'CANCELADA');
  },

  async markNoShow(id) {
    const appointment = await this.getById(id);
    validateTransition(appointment.status, 'NO_ASISTE');
    return appointmentModel.updateStatus(id, 'NO_ASISTE');
  },

  async finish(id) {
    const appointment = await this.getById(id);
    validateTransition(appointment.status, 'FINALIZADA');
    return appointmentModel.updateStatus(id, 'FINALIZADA');
  },

  async enterRoom(id) {
    const appointment = await this.getById(id);
    if (appointment.status === 'EN_SALA') return appointment;
    validateTransition(appointment.status, 'EN_SALA');
    return appointmentModel.updateStatus(id, 'EN_SALA');
  },

  async resendLink(id) {
    const appointment = await this.getById(id);
    const token = await tokenService.regenerate(
      id,
      appointment.scheduled_at,
      appointment.duration_minutes
    );
    await emailService.sendAppointmentLink(appointment, token);
    return appointment;
  },

  async revokeToken(id) {
    const appointment = await this.getById(id);
    const token = await tokenService.regenerate(
      id,
      appointment.scheduled_at,
      appointment.duration_minutes
    );
    await emailService.sendAppointmentLink(appointment, token);
    return appointment;
  },
};

module.exports = appointmentService;
