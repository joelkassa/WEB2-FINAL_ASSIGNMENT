const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    next();
  };
};

const registerSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().min(8).max(128).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().max(20).allow('').optional(),
  role: Joi.string().valid('client', 'worker').required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  refreshSchema,
};
const workerProfileSchema = Joi.object({
  categoryId: Joi.number().integer().required(),
  businessName: Joi.string().max(255).optional(),
  bio: Joi.string().max(2000).optional(),
  hourlyRate: Joi.number().positive().optional(),
  address: Joi.string().max(255).optional(),
  city: Joi.string().max(100).optional(),
});

const workerUpdateSchema = Joi.object({
  categoryId: Joi.number().integer().optional(),
  businessName: Joi.string().max(255).optional(),
  bio: Joi.string().max(2000).optional(),
  hourlyRate: Joi.number().positive().optional(),
  address: Joi.string().max(255).optional(),
  city: Joi.string().max(100).optional(),
});

const skillSchema = Joi.object({
  skillName: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).optional(),
  certificationUrl: Joi.string().uri().max(500).optional(),
});

const categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(1000).optional(),
  icon: Joi.string().max(255).optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  refreshSchema,
  workerProfileSchema,
  workerUpdateSchema,
  skillSchema,
  categorySchema,
};

