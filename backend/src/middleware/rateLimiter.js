const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter.
 * 100 requests per 15-minute window.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Demasiadas solicitudes, intente de nuevo más tarde',
  },
});

/**
 * Auth endpoints rate limiter (login, refresh).
 * 10 requests per 15-minute window to mitigate brute-force attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Demasiados intentos de autenticación, intente de nuevo más tarde',
  },
});

/**
 * Room / patient endpoints rate limiter.
 * 20 requests per 15-minute window.
 */
const roomLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Demasiadas solicitudes a este recurso, intente de nuevo más tarde',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  roomLimiter,
};
