const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const db = require('../../database/db');
import { isMissingTableError } from '../../utils/dbErrors';

router.get('/', asyncHandler(async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM categories WHERE is_active = TRUE ORDER BY name ASC'
    );
    res.json(rows);
  } catch (error) {
    if (isMissingTableError(error)) return res.json([]);
    throw error;
  }
}));

module.exports = router;

export {};
