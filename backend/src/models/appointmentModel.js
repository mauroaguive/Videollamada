const { pool } = require('../config/database');

const appointmentModel = {
  async findAll(filters = {}) {
    const { professionalId, status, dateFrom, dateTo, limit = 50, offset = 0 } = filters;
    const conditions = [];
    const params = [];

    if (professionalId) {
      conditions.push('a.professional_id = ?');
      params.push(professionalId);
    }
    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
    }
    if (dateFrom) {
      conditions.push('a.scheduled_at >= ?');
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push('a.scheduled_at <= ?');
      params.push(dateTo);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM appointments a ${where}`;
    const [countRows] = await pool.execute(countQuery, params);
    const total = countRows[0].total;

    const dataQuery = `
      SELECT a.*, u.first_name AS professional_first_name, u.last_name AS professional_last_name,
             u.specialty AS professional_specialty
      FROM appointments a
      JOIN users u ON a.professional_id = u.id
      ${where}
      ORDER BY a.scheduled_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
    const [rows] = await pool.execute(dataQuery, params);

    return { rows, total };
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT a.*, u.first_name AS professional_first_name, u.last_name AS professional_last_name,
              u.specialty AS professional_specialty, u.email AS professional_email
       FROM appointments a
       JOIN users u ON a.professional_id = u.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async create(data) {
    const {
      professional_id, patient_name, patient_document_type, patient_document,
      patient_phone, patient_email, scheduled_at, duration_minutes = 30,
      consultation_type = 'General', notes, created_by,
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO appointments (professional_id, patient_name, patient_document_type, patient_document,
        patient_phone, patient_email, scheduled_at, duration_minutes, consultation_type, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [professional_id, patient_name, patient_document_type, patient_document,
       patient_phone, patient_email, scheduled_at, duration_minutes,
       consultation_type, notes || null, created_by]
    );
    return this.findById(result.insertId);
  },

  async update(id, fields) {
    const allowedKeys = [
      'patient_name', 'patient_document_type', 'patient_document',
      'patient_phone', 'patient_email', 'scheduled_at', 'duration_minutes',
      'consultation_type', 'notes', 'professional_id',
    ];

    const keys = Object.keys(fields).filter((k) => allowedKeys.includes(k));
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => fields[k]);
    values.push(id);

    await pool.execute(`UPDATE appointments SET ${setClauses} WHERE id = ?`, values);
    return this.findById(id);
  },

  async updateStatus(id, status) {
    await pool.execute('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },
};

module.exports = appointmentModel;
