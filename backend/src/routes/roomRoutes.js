const router = require('express').Router();
const auth = require('../middleware/auth');
const { roomLimiter } = require('../middleware/rateLimiter');
const roomController = require('../controllers/roomController');

router.get('/validate/:token', roomLimiter, roomController.validateToken);
router.post('/join/:token', roomLimiter, roomController.patientJoin);
router.post('/professional/join/:appointmentId', auth, roomController.professionalJoin);

module.exports = router;
