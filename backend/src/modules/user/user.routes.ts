const router = require('express').Router();
const Joi = require('joi');
const { requireUserId } = require('../../middleware/currentUser');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const db = require('../../database/db');

const profileSchema = Joi.object({
  firstName: Joi.string().max(80).required(),
  lastName: Joi.string().max(80).required(),
  phone: Joi.string().max(30).allow(null, '')
});

const addressSchema = Joi.object({
  label: Joi.string().max(60).allow(null, ''),
  line1: Joi.string().max(180).required(),
  line2: Joi.string().max(180).allow(null, ''),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  postalCode: Joi.string().max(30).required(),
  country: Joi.string().max(80).default('India'),
  isDefault: Joi.boolean().default(false)
});

router.use(requireUserId);

router.get('/me', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1',
    [req.user.sub]
  );
  res.json(rows[0]);
}));

router.patch('/me', validate(profileSchema), asyncHandler(async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  const { rows } = await db.query(
    `UPDATE users
     SET first_name = $1, last_name = $2, phone = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING id, email, first_name, last_name, phone, role, created_at`,
    [firstName, lastName, phone, req.user.sub]
  );
  res.json(rows[0]);
}));

router.get('/me/addresses', asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC', [req.user.sub]);
  res.json(rows);
}));

router.post('/me/addresses', validate(addressSchema), asyncHandler(async (req, res) => {
  const address = req.body;
  const { rows } = await db.query(
    `INSERT INTO addresses (user_id, label, line1, line2, city, state, postal_code, country, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      req.user.sub,
      address.label,
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postalCode,
      address.country,
      address.isDefault
    ]
  );
  res.status(201).json(rows[0]);
}));

router.put('/me/addresses/:addressId', validate(addressSchema), asyncHandler(async (req, res) => {
  const address = req.body;
  const { rows } = await db.query(
    `UPDATE addresses
     SET label = $1, line1 = $2, line2 = $3, city = $4, state = $5,
         postal_code = $6, country = $7, is_default = $8, updated_at = NOW()
     WHERE id = $9 AND user_id = $10
     RETURNING *`,
    [
      address.label,
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postalCode,
      address.country,
      address.isDefault,
      req.params.addressId,
      req.user.sub
    ]
  );
  res.json(rows[0]);
}));

router.delete('/me/addresses/:addressId', asyncHandler(async (req, res) => {
  await db.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [req.params.addressId, req.user.sub]);
  res.status(204).send();
}));

module.exports = router;

export {};
