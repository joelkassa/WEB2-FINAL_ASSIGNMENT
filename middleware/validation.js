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

const bookingCreateSchema = Joi.object({
  workerId: Joi.number().integer().required(),
  requestedDate: Joi.date().iso().required(),
  requestedTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  notes: Joi.string().max(2000).optional(),
});

const reviewSchema = Joi.object({
  bookingId: Joi.number().integer().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(2000).optional(),
});

const disputeSchema = Joi.object({
  bookingId: Joi.number().integer().required(),
  reason: Joi.string().valid('no_show', 'poor_quality', 'payment_issue', 'safety_concern', 'other').required(),
  description: Joi.string().min(10).max(2000).required(),
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
  bookingCreateSchema,
  reviewSchema,
  disputeSchema,
};
