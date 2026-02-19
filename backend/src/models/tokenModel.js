const { pool } = require('../config/database');

const tokenModel = {
  async create({ appointment_id, token, expires_at }) {
    const [result] = await pool.execute(
      'INSERT INTO appointment_tokens (appointment_id, token, expires_at) VALUES (?, ?, ?)',
      [appointment_id, token, expires_at]
    );
    return { id: result.insertId, appointment_id, token, expires_at };
  },

  async findByToken(token) {
    const [rows] = await pool.execute(
      `SELECT t.*, a.id AS appointment_id, a.professional_id, a.patient_name,
              a.patient_document_type, a.patient_document, a.patient_phone,
              a.patient_email, a.scheduled_at, a.duration_minutes,
              a.consultation_type, a.status, a.notes,
              u.first_name AS professional_first_name, u.last_name AS professional_last_name,
              u.specialty AS professional_specialty
       FROM appointment_tokens t
       JOIN appointments a ON t.appointment_id = a.id
       JOIN users u ON a.professional_id = u.id
       WHERE t.token = ?`,
      [token]
    );
    return rows[0] || null;
  },

  async findByAppointmentId(appointmentId) {
    const [rows] = await pool.execute(
      'SELECT * FROM appointment_tokens WHERE appointment_id = ?',
      [appointmentId]
    );
    return rows[0] || null;
  },

  async revoke(appointmentId) {
    await pool.execute(
      'UPDATE appointment_tokens SET is_revoked = 1 WHERE appointment_id = ?',
      [appointmentId]
    );
  },

  async incrementUsedCount(id) {
    await pool.execute(
      'UPDATE appointment_tokens SET used_count = used_count + 1 WHERE id = ?',
      [id]
    );
  },

  async deleteByAppointmentId(appointmentId) {
    await pool.execute('DELETE FROM appointment_tokens WHERE appointment_id = ?', [appointmentId]);
  },
};

module.exports = tokenModel;
