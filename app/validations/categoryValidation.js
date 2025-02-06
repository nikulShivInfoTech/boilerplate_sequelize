const Joi=require('joi')
const categoryAddV=Joi.object({
    category_name: Joi.string().min(3).max(50).required().messages({
        'string.base': 'Category name must be a string.',
        'string.empty': 'Category name is required.',
        'string.min': 'Category name must be at least 3 characters long.',
        'string.max': 'Category name cannot exceed 50 characters.',
        'any.required': 'Category name is required.',
      }),
})
module.exports={categoryAddV}