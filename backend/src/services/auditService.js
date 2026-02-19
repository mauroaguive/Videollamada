const { pool } = require('../config/database');

/**
 * Audit service — writes audit log entries to the audit_logs table.
 */
const auditService = {
  /**
   * Log an audit event to the database.
   *
   * @param {Object} entry
   * @param {number|null} entry.appointmentId - Related appointment ID (nullable)
   * @param {string} entry.actorType - Role of the actor (ADMIN, PROFESIONAL, PACIENTE, SISTEMA)
   * @param {string} entry.actorId - Identifier of the actor (user id or 'system')
   * @param {string} entry.action - Description of the action performed
   * @param {string|null} entry.ipAddress - IP address of the request
   * @param {string|null} entry.userAgent - User agent string of the request
   * @param {Object|null} entry.metadata - Additional JSON metadata (nullable)
   * @returns {Promise<number>} The inserted row ID
   */
  async log({ appointmentId, actorType, actorId, action, ipAddress, userAgent, metadata }) {
    const [result] = await pool.execute(
      `INSERT INTO audit_logs (appointment_id, actor_type, actor_id, action, ip_address, user_agent, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        appointmentId || null,
        actorType,
        actorId,
        action,
        ipAddress || null,
        userAgent || null,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );
    return result.insertId;
  },

  /**
   * Retrieve audit logs for a specific appointment.
   *
   * @param {number} appointmentId
   * @returns {Promise<Array>} List of audit log rows
   */
  async findByAppointment(appointmentId) {
    const [rows] = await pool.execute(
      `SELECT id, appointment_id, actor_type, actor_id, action,
              ip_address, user_agent, metadata, created_at
       FROM audit_logs
       WHERE appointment_id = ?
       ORDER BY created_at DESC`,
      [appointmentId]
    );
    return rows;
  },
};

module.exports = auditService;
