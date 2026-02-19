const { pool } = require('../config/database');

const auditModel = {
  async create(data) {
    const { appointment_id, actor_type, actor_id, action, ip_address, user_agent, metadata } = data;
    const [result] = await pool.execute(
      `INSERT INTO audit_logs (appointment_id, actor_type, actor_id, action, ip_address, user_agent, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        appointment_id || null, actor_type, actor_id, action,
        ip_address || null, user_agent || null,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );
    return result.insertId;
  },

  async findByAppointmentId(appointmentId) {
    const [rows] = await pool.execute(
      `SELECT * FROM audit_logs WHERE appointment_id = ? ORDER BY created_at DESC`,
      [appointmentId]
    );
    return rows;
  },
};

module.exports = auditModel;
