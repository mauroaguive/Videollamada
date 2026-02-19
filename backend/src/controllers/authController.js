const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { pool } = require('../config/database');
const userModel = require('../models/userModel');

/**
 * Parse a JWT expiration string (e.g. '1h', '7d', '30m') into seconds.
 * Falls back to 3600 (1 hour) if the format is unrecognised.
 */
function parseExpiry(expiresIn) {
  const match = String(expiresIn).match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 3600;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 3600;
  }
}

/**
 * POST /api/auth/login
 * Validates email and password, returns access + refresh tokens.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Check that user is active
    if (!user.is_active) {
      return res.status(401).json({ message: 'Cuenta desactivada' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // JWT payload
    const payload = { id: user.id, email: user.email, role: user.role };

    // Generate access token
    const accessToken = jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    });

    // Generate refresh token
    const refreshToken = jwt.sign(payload, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiresIn,
    });

    // Calculate refresh token expiry date for DB storage
    const refreshExpirySecs = parseExpiry(env.jwt.refreshExpiresIn);
    const expiresAt = new Date(Date.now() + refreshExpirySecs * 1000);

    // Store refresh token in the database
    await pool.execute(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [user.id, refreshToken, expiresAt]
    );

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * POST /api/auth/refresh
 * Validates the refresh token and issues a new access token.
 */
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token es requerido' });
    }

    // Verify the JWT signature and expiration
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.jwt.refreshSecret);
    } catch (err) {
      return res.status(401).json({ message: 'Refresh token inválido o expirado' });
    }

    // Check that the token exists in DB and has not been revoked
    const [rows] = await pool.execute(
      `SELECT id, user_id, is_revoked, expires_at
       FROM refresh_tokens
       WHERE token = ?`,
      [refreshToken]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Refresh token no encontrado' });
    }

    const storedToken = rows[0];

    if (storedToken.is_revoked) {
      return res.status(401).json({ message: 'Refresh token ha sido revocado' });
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      return res.status(401).json({ message: 'Refresh token ha expirado' });
    }

    // Generate a new access token
    const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
    const accessToken = jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    });

    return res.json({ accessToken });
  } catch (err) {
    console.error('Refresh error:', err.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * POST /api/auth/logout
 * Revokes the provided refresh token.
 */
async function logout(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token es requerido' });
    }

    // Mark the token as revoked
    const [result] = await pool.execute(
      `UPDATE refresh_tokens SET is_revoked = 1 WHERE token = ?`,
      [refreshToken]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Refresh token no encontrado' });
    }

    return res.json({ message: 'Sesión cerrada correctamente' });
  } catch (err) {
    console.error('Logout error:', err.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

module.exports = {
  login,
  refresh,
  logout,
};
