const tokenService = require('../services/tokenService');
const appointmentService = require('../services/appointmentService');
const auditService = require('../services/auditService');

async function validateToken(req, res) {
  try {
    const record = await tokenService.validate(req.params.token);
    res.json({
      appointment_id: record.appointment_id,
      patient_name: record.patient_name,
      professional_name: `${record.professional_first_name} ${record.professional_last_name}`,
      scheduled_at: record.scheduled_at,
      consultation_type: record.consultation_type,
      status: record.status,
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function patientJoin(req, res) {
  try {
    const record = await tokenService.validate(req.params.token);

    await auditService.log({
      appointmentId: record.appointment_id,
      actorType: 'PACIENTE',
      actorId: req.params.token.substring(0, 16),
      action: 'ROOM_JOIN',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { patient_name: record.patient_name },
    });

    if (record.status === 'PROGRAMADA') {
      await appointmentService.enterRoom(record.appointment_id);
    }

    res.json({
      appointment_id: record.appointment_id,
      patient_name: record.patient_name,
      professional_name: `${record.professional_first_name} ${record.professional_last_name}`,
      scheduled_at: record.scheduled_at,
      consultation_type: record.consultation_type,
      status: 'EN_SALA',
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

async function professionalJoin(req, res) {
  try {
    const appointment = await appointmentService.getById(req.params.appointmentId);

    if (appointment.professional_id !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado para esta cita' });
    }

    await auditService.log({
      appointmentId: appointment.id,
      actorType: 'PROFESIONAL',
      actorId: String(req.user.id),
      action: 'ROOM_JOIN',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: null,
    });

    if (appointment.status === 'PROGRAMADA') {
      await appointmentService.enterRoom(appointment.id);
    }

    res.json({
      appointment_id: appointment.id,
      patient_name: appointment.patient_name,
      professional_name: `${appointment.professional_first_name} ${appointment.professional_last_name}`,
      scheduled_at: appointment.scheduled_at,
      consultation_type: appointment.consultation_type,
      status: 'EN_SALA',
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = { validateToken, patientJoin, professionalJoin };
