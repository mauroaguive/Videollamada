const router = require('express').Router();
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { validateUser, handleValidation } = require('../middleware/validator');
const userController = require('../controllers/userController');

router.use(auth);

// Read access for ADMIN and PROFESIONAL (needed for appointment professional dropdown)
router.get('/', roleGuard(['ADMIN', 'PROFESIONAL']), userController.getAll);
router.get('/:id', roleGuard(['ADMIN', 'PROFESIONAL']), userController.getById);

// Write access for ADMIN only
router.post('/', roleGuard(['ADMIN']), validateUser, handleValidation, userController.create);
router.put('/:id', roleGuard(['ADMIN']), userController.update);
router.delete('/:id', roleGuard(['ADMIN']), userController.deactivate);

module.exports = router;
