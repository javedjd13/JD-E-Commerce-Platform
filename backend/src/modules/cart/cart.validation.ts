const Joi = require('joi');

const addItemSchema = Joi.object({
  productVariantId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).max(99).required()
});

const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(99).required()
});

module.exports = { addItemSchema, updateItemSchema };

export {};
