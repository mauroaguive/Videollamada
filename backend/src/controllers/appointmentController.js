const appointmentService = require('../services/appointmentService');
const tokenModel = require('../models/tokenModel');
const env = require('../config/env');

async function getAll(req, res) {
  try {
    const { professionalId, status, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
    const filters = {
      professionalId: req.user.role === 'PROFESIONAL' ? req.user.id : professionalId,
      status,
      dateFrom,
      dateTo,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    };
    const { rows, total } = await appointmentService.getAll(filters);
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get appointments error:', err.message);
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function getById(req, res) {
  try {
    const appointment = await appointmentService.getById(req.params.id);
    if (req.user.role === 'PROFESIONAL' && appointment.professional_id !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    // Include patient link if token exists and appointment is active
    const tokenRecord = await tokenModel.findByAppointmentId(req.params.id);
    const result = { ...appointment };
    if (tokenRecord && !tokenRecord.is_revoked) {
      result.patient_link = `${env.frontendUrl}/sala/paciente/${tokenRecord.token}`;
    }
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function create(req, res) {
  try {
    const appointment = await appointmentService.create(req.body, req.user.id);
    res.status(201).json(appointment);
  } catch (err) {
    console.error('Create appointment error:', err.message);
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function update(req, res) {
  try {
    const appointment = await appointmentService.getById(req.params.id);
    if (req.user.role === 'PROFESIONAL' && appointment.professional_id !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    const updated = await appointmentService.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function cancel(req, res) {
  try {
    const result = await appointmentService.cancel(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function markNoShow(req, res) {
  try {
    const result = await appointmentService.markNoShow(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function finish(req, res) {
  try {
    const result = await appointmentService.finish(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function resendLink(req, res) {
  try {
    const result = await appointmentService.resendLink(req.params.id);
    const tokenRecord = await tokenModel.findByAppointmentId(req.params.id);
    const patient_link = tokenRecord ? `${env.frontendUrl}/sala/paciente/${tokenRecord.token}` : null;
    res.json({ message: 'Enlace reenviado correctamente', data: result, patient_link });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function revokeToken(req, res) {
  try {
    const result = await appointmentService.revokeToken(req.params.id);
    const tokenRecord = await tokenModel.findByAppointmentId(req.params.id);
    const patient_link = tokenRecord ? `${env.frontendUrl}/sala/paciente/${tokenRecord.token}` : null;
    res.json({ message: 'Token revocado y nuevo enlace enviado', data: result, patient_link });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = { getAll, getById, create, update, cancel, markNoShow, finish, resendLink, revokeToken };
