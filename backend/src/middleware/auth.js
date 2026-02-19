const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * JWT verification middleware.
 * Extracts Bearer token from the Authorization header, verifies it,
 * and attaches the decoded payload to req.user.
 * Returns 401 if the token is missing, malformed, or invalid.
 */
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwt.secret);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
}

module.exports = auth;
