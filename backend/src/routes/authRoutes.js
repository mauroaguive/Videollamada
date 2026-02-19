const router = require('express').Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateLogin, handleValidation } = require('../middleware/validator');

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  validateLogin,
  handleValidation,
  authController.login
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  authLimiter,
  authController.refresh
);

// POST /api/auth/logout (requires authenticated user)
router.post(
  '/logout',
  auth,
  authController.logout
);

module.exports = router;
