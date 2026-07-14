const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const db = require('../../database/db');
import { isMissingTableError } from '../../utils/dbErrors';

router.get('/', asyncHandler(async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM banners
     WHERE is_active = TRUE AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW())
     ORDER BY sort_order ASC`
    );
    res.json(rows);
  } catch (error) {
    if (isMissingTableError(error)) return res.json([]);
    throw error;
  }
}));

module.exports = router;

export {};
