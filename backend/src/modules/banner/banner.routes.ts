const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const db = require('../../database/db');

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT * FROM banners
     WHERE is_active = TRUE AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW())
     ORDER BY sort_order ASC`
  );
  res.json(rows);
}));

module.exports = router;

export {};
