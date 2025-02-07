const Joi = require('joi');

const productValidation = Joi.object({
  product_name: Joi.string().min(3).max(50).required().empty('').messages({
    'string.base': 'Product name must be a string.',
    'string.empty': 'Product name cannot be empty.',
    'string.min': 'Product name must be at least 3 characters long.',
    'string.max': 'Product name cannot exceed 50 characters.',
    'any.required': 'Product name is required.',
  }),
  category_id: Joi.number().integer().required().messages({
    'number.base': 'Category ID must be a number.',
    'number.integer': 'Category ID must be an integer.',
    'any.required': 'Category ID is required.',
  }),
});

const productCommon = Joi.object({
  product_name: Joi.string().min(3).max(50).required().empty('').messages({
    'string.base': 'Product name must be a string.',
    'string.empty': 'Product name cannot be empty.',
    'string.min': 'Product name must be at least 3 characters long.',
    'string.max': 'Product name cannot exceed 50 characters.',
    'any.required': 'Product name is required.',
  }),
});

module.exports = { productValidation, productCommon };
