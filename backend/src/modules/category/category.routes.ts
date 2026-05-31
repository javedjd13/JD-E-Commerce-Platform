const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const db = require('../../database/db');

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    'SELECT * FROM categories WHERE is_active = TRUE ORDER BY name ASC'
  );
  res.json(rows);
}));

module.exports = router;

export {};
