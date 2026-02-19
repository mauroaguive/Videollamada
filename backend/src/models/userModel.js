const { pool } = require('../config/database');

/**
 * User model — provides MySQL queries for the users table.
 */
const userModel = {
  /**
   * Retrieve all active users ordered by last name.
   * @returns {Promise<Array>} List of user rows
   */
  async findAll() {
    const [rows] = await pool.execute(
      `SELECT id, email, first_name, last_name, role, specialty,
              license_number, is_active, created_at, updated_at
       FROM users
       WHERE is_active = 1
       ORDER BY last_name ASC`
    );
    return rows;
  },

  /**
   * Find a single user by their ID.
   * @param {number} id
   * @returns {Promise<Object|null>} User row or null
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, email, password_hash, first_name, last_name, role, specialty,
              license_number, is_active, created_at, updated_at
       FROM users
       WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Find a single user by their email address.
   * @param {string} email
   * @returns {Promise<Object|null>} User row or null
   */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT id, email, password_hash, first_name, last_name, role, specialty,
              license_number, is_active, created_at, updated_at
       FROM users
       WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Create a new user.
   * @param {Object} data
   * @param {string} data.email
   * @param {string} data.password_hash
   * @param {string} data.first_name
   * @param {string} data.last_name
   * @param {string} data.role
   * @param {string|null} data.specialty
   * @param {string|null} data.license_number
   * @returns {Promise<Object>} The created user (without password_hash)
   */
  async create({ email, password_hash, first_name, last_name, role, specialty, license_number }) {
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, specialty, license_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, password_hash, first_name, last_name, role, specialty || null, license_number || null]
    );
    return this.findById(result.insertId);
  },

  /**
   * Update a user by ID with a dynamic set of fields.
   * Only keys present in the fields object will be updated.
   * @param {number} id
   * @param {Object} fields - Key/value pairs to update (e.g. { first_name: 'Ana', specialty: 'Cardio' })
   * @returns {Promise<Object|null>} Updated user or null
   */
  async update(id, fields) {
    const allowedKeys = [
      'email', 'password_hash', 'first_name', 'last_name',
      'role', 'specialty', 'license_number', 'is_active',
    ];

    const keys = Object.keys(fields).filter((k) => allowedKeys.includes(k));
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => fields[k]);
    values.push(id);

    await pool.execute(
      `UPDATE users SET ${setClauses} WHERE id = ?`,
      values
    );
    return this.findById(id);
  },

  /**
   * Soft-delete (deactivate) a user by setting is_active = 0.
   * @param {number} id
   * @returns {Promise<boolean>} True if a row was affected
   */
  async deactivate(id) {
    const [result] = await pool.execute(
      `UPDATE users SET is_active = 0 WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = userModel;
