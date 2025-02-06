const Joi = require('joi');

const userRegistrationValidation = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.base': 'Name must be a string.',
    'string.empty': 'Name is can not be empty.',
    'string.min': 'Name must be at least 3 characters long.',
    'string.max': 'Name cannot exceed 50 characters.',
    'any.required': 'Name is required.',
  }),

  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address.',
    'string.empty': 'Email is can not be empty.',
    'any.required': 'Email is required.',
  }),

  password: Joi.string().min(6).max(20).required().messages({
    'string.empty': 'Password can not be empty.',
    'string.min': 'Password must be at least 6 characters long.',
    'string.max': 'Password cannot exceed 20 characters.',
    'any.required': 'Password is required.',
  }),

  address: Joi.string().max(255).optional().messages({
    'string.max': 'Address cannot exceed 255 characters.',
  }),

  gender: Joi.string().valid('Male', 'Female', 'Other').required().messages({
    'any.only': 'Gender must be either Male, Female, or Other.',
    'any.required': 'Gender is required.',
  }),

  dateOfBirth: Joi.date().less('now').required().messages({
    'date.base': 'Date of Birth must be a valid date.',
    'date.less': 'Date of Birth cannot be in the future.',
    'any.required': 'Date of Birth is required.',
  }),

  country: Joi.string().required().messages({
    'string.empty': 'Country can not be empty.',
    'any.required': 'Country is required.',
  }),

  state: Joi.string().required().messages({
    'string.empty': 'State is can not be empty.',
    'any.required': 'State is required.',
  }),

  city: Joi.string().required().messages({
    'string.empty': 'City is can not be empty.',
    'any.required': 'City is required.',
  }),

  pincode: Joi.string()
    .pattern(/^\d{5,6}$/)
    .required()
    .messages({
      'string.pattern.base': 'Pincode must be 5 or 6 digits long.',
      'string.empty': 'Pincode is can not be empty.',
      'any.required': 'Pincode is required.',
    }),
});

const editUserValidation = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.base': 'Name must be a string.',
    'string.empty': 'Name is can not be empty.',
    'string.min': 'Name must be at least 3 characters long.',
    'string.max': 'Name cannot exceed 50 characters.',
    'any.required': 'Name is required.',
  }),

  address: Joi.string().max(255).optional().messages({
    'string.max': 'Address cannot exceed 255 characters.',
  }),

  gender: Joi.string().valid('Male', 'Female', 'Other').required().messages({
    'any.only': 'Gender must be either Male, Female, or Other.',
    'any.required': 'Gender is required.',
  }),

  dateOfBirth: Joi.date().less('now').required().messages({
    'date.base': 'Date of Birth must be a valid date.',
    'date.less': 'Date of Birth cannot be in the future.',
    'any.required': 'Date of Birth is required.',
  }),

  country: Joi.string().required().messages({
    'string.empty': 'Country is can not be empty.',
    'any.required': 'Country is required.',
  }),

  state: Joi.string().required().messages({
    'string.empty': 'State is can not be empty.',
    'any.required': 'State is required.',
  }),

  city: Joi.string().required().messages({
    'string.empty': 'City is can not be empty.',
    'any.required': 'City is required.',
  }),

  pincode: Joi.string()
    .pattern(/^\d{5,6}$/)
    .required()
    .messages({
      'string.pattern.base': 'Pincode must be 5 or 6 digits long.',
      'string.empty': 'Pincode is can not be empty.',
      'any.required': 'Pincode is required.',
    }),
});

const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address.',
    'string.empty': 'Email is can not be empty.',
    'any.required': 'Email is required.',
  }),

  password: Joi.string().min(6).max(20).required().messages({
    'string.empty': 'Password is can not be empty.',
    'string.min': 'Password must be at least 6 characters long.',
    'string.max': 'Password cannot exceed 20 characters.',
    'any.required': 'Password is required.',
  }),
});

const resetPasswordvalidate = Joi.object({
  currentPassword: Joi.string().required().min(6).max(20).messages({
    'string.base': 'Current password must be a string',
    'string.empty': 'Current password can not be empty',
    'string.max': 'Current password cannot exceed 20 characters.',
    'any.required': 'Current password is a required field',
    'string.min': 'Current password must be at least 6 characters long',
  }),
  newPassword: Joi.string().required().min(6).max(20).messages({
    'string.base': 'New password must be a string',
    'string.empty': 'New password cannot be empty',
    'string.max': 'New password cannot exceed 20 characters.',
    'any.required': 'New password is a required field',
    'string.min': 'New password must be at least 6 characters long',
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm password must match the new password',
      'string.empty': 'Confirm password cannot be empty',
      'any.required': 'Confirm password is a required field',
    }),
});

const forgotPasswordValidation = Joi.object({
  otp: Joi.number().min(6).required().messages({
    'string.empty': 'OTP is can not be empty.',
    'string.min': 'OTP must be at least 6 characters long.',
    'any.required': 'OTP is required.',
  }),
  newPassword: Joi.string().required().min(6).max(20).messages({
    'string.base': 'New password must be a string',
    'string.empty': 'New password cannot be empty',
    'string.max': 'New password cannot exceed 20 characters.',
    'any.required': 'New password is a required field',
    'string.min': 'New password must be at least 6 characters long',
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm password must match the new password',
      'string.empty': 'Confirm password cannot be empty',
      'any.required': 'Confirm password is a required field',
    }),
})

module.exports = {
  userRegistrationValidation,
  editUserValidation,
  loginValidation,
  resetPasswordvalidate, forgotPasswordValidation
};
