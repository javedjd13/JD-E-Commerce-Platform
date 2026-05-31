const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().max(160),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  firstName: Joi.string().max(80),
  lastName: Joi.string().max(80)
}).or('name', 'firstName');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = { signupSchema, loginSchema };

export {};
