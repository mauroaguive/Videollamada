const router = require('express').Router();
const auth = require('../middleware/auth');
const { validateAppointment, validateUpdateAppointment, handleValidation } = require('../middleware/validator');
const appointmentController = require('../controllers/appointmentController');

router.use(auth);

router.get('/', appointmentController.getAll);
router.post('/', validateAppointment, handleValidation, appointmentController.create);
router.get('/:id', appointmentController.getById);
router.put('/:id', validateUpdateAppointment, handleValidation, appointmentController.update);
router.patch('/:id/cancel', appointmentController.cancel);
router.patch('/:id/no-show', appointmentController.markNoShow);
router.patch('/:id/finish', appointmentController.finish);
router.post('/:id/resend-link', appointmentController.resendLink);
router.post('/:id/revoke-token', appointmentController.revokeToken);

module.exports = router;
