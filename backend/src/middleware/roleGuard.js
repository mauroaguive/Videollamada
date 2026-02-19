/**
 * Role-based access control middleware.
 * Receives an array of allowed roles and checks req.user.role.
 * Must be used AFTER the auth middleware so that req.user is available.
 * Returns 403 if the user's role is not in the allowed list.
 *
 * @param {string[]} allowedRoles - e.g. ['ADMIN', 'PROFESIONAL']
 * @returns {Function} Express middleware
 */
function roleGuard(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'No tiene permisos para acceder a este recurso',
      });
    }

    next();
  };
}

module.exports = roleGuard;
