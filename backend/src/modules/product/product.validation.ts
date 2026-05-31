const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().max(160).required(),
  slug: Joi.string().max(180).required(),
  description: Joi.string().allow('', null),
  categoryId: Joi.string().uuid().required(),
  basePrice: Joi.number().precision(2).min(0).required(),
  brand: Joi.string().max(120).allow(null, ''),
  isActive: Joi.boolean().default(true),
  variants: Joi.array().items(
    Joi.object({
      sku: Joi.string().max(80).required(),
      size: Joi.string().max(40).allow(null, ''),
      color: Joi.string().max(40).allow(null, ''),
      price: Joi.number().precision(2).min(0).required(),
      stockQuantity: Joi.number().integer().min(0).default(0)
    })
  ).default([]),
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      altText: Joi.string().max(180).allow(null, ''),
      sortOrder: Joi.number().integer().min(0).default(0)
    })
  ).default([])
});

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  q: Joi.string().max(120),
  categoryId: Joi.string().uuid(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  rating: Joi.number().min(1).max(5),
  sort: Joi.string().valid('price_asc', 'price_desc', 'popular', 'newest')
});

module.exports = { productSchema, listQuerySchema };

export {};
