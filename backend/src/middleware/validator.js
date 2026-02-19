const { body, validationResult } = require('express-validator');

/**
 * Validation rules for login endpoint.
 */
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
];

/**
 * Validation rules for creating / updating a user.
 */
const validateUser = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('first_name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .trim(),
  body('last_name')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .trim(),
  body('role')
    .isIn(['ADMIN', 'PROFESIONAL'])
    .withMessage('El rol debe ser ADMIN o PROFESIONAL'),
  body('specialty')
    .optional({ values: 'falsy' })
    .trim(),
  body('license_number')
    .optional({ values: 'falsy' })
    .trim(),
];

/**
 * Validation rules for creating an appointment.
 */
const validateAppointment = [
  body('professional_id')
    .isInt({ min: 1 })
    .withMessage('El ID del profesional debe ser un entero válido'),
  body('patient_name')
    .notEmpty()
    .withMessage('El nombre del paciente es requerido')
    .trim(),
  body('patient_document_type')
    .isIn(['CC', 'CE', 'TI', 'PP', 'RC'])
    .withMessage('El tipo de documento debe ser CC, CE, TI, PP o RC'),
  body('patient_document')
    .notEmpty()
    .withMessage('El número de documento del paciente es requerido')
    .trim(),
  body('patient_phone')
    .notEmpty()
    .withMessage('El teléfono del paciente es requerido')
    .trim(),
  body('patient_email')
    .isEmail()
    .withMessage('Debe ser un email de paciente válido')
    .normalizeEmail(),
  body('scheduled_at')
    .isISO8601()
    .withMessage('La fecha programada debe estar en formato ISO 8601'),
  body('duration_minutes')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La duración debe ser un entero positivo'),
  body('consultation_type')
    .optional({ values: 'falsy' })
    .trim(),
  body('notes')
    .optional({ values: 'falsy' })
    .trim(),
];

/**
 * Validation rules for updating an appointment (all fields optional).
 */
const validateUpdateAppointment = [
  body('professional_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del profesional debe ser un entero válido'),
  body('patient_name')
    .optional()
    .notEmpty()
    .withMessage('El nombre del paciente no puede estar vacío')
    .trim(),
  body('patient_document_type')
    .optional()
    .isIn(['CC', 'CE', 'TI', 'PP', 'RC'])
    .withMessage('El tipo de documento debe ser CC, CE, TI, PP o RC'),
  body('patient_document')
    .optional()
    .notEmpty()
    .withMessage('El número de documento no puede estar vacío')
    .trim(),
  body('patient_phone')
    .optional()
    .notEmpty()
    .withMessage('El teléfono no puede estar vacío')
    .trim(),
  body('patient_email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email de paciente válido')
    .normalizeEmail(),
  body('scheduled_at')
    .optional()
    .isISO8601()
    .withMessage('La fecha programada debe estar en formato ISO 8601'),
  body('duration_minutes')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La duración debe ser un entero positivo'),
  body('consultation_type')
    .optional({ values: 'falsy' })
    .trim(),
  body('notes')
    .optional({ values: 'falsy' })
    .trim(),
];

/**
 * Middleware that checks for validation errors from express-validator.
 * Returns 400 with an array of error messages if validation fails.
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Errores de validación',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
}

module.exports = {
  validateLogin,
  validateUser,
  validateAppointment,
  validateUpdateAppointment,
  handleValidation,
};
