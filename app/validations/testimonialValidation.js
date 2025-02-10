const Joi = require('joi');

const testimonialValidation= Joi.object({
  name: Joi.string().min(3).max(50).required().empty('').messages({
    'string.base': 'Name must be a string.',
    'string.empty': 'Name cannot be empty.',
    'string.min': 'Name must be at least 3 characters long.',
    'string.max': 'Name cannot exceed 50 characters.',
    'any.required': 'Name is required.',
  }),
  description: Joi.string().min(3).max(500).allow('').optional().messages({
    'string.base': 'Description must be a string.',
    'string.min': 'Description must be at least 3 characters long.',
    'string.max': 'Description cannot exceed 500 characters.',
  }),
  rating: Joi.number().integer().min(1).max(5).optional().messages({
    'number.base': 'Rating must be a number.',
    'number.integer': 'Rating must be an integer.',
    'number.min': 'Rating must be at least 1.',
    'number.max': 'Rating cannot be more than 5.',
  }),
});
module.exports={testimonialValidation}
