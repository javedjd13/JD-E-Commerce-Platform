const router = require('express').Router();
const { requireUserId } = require('../../middleware/currentUser');
const asyncHandler = require('../../utils/asyncHandler');
const db = require('../../database/db');

router.use(requireUserId);

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT w.id, p.id AS product_id, p.name, p.slug, p.base_price
     FROM wishlist_items w
     JOIN products p ON p.id = w.product_id
     WHERE w.user_id = $1
     ORDER BY w.created_at DESC`,
    [req.user.sub]
  );
  res.json(rows);
}));

router.post('/:productId', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `INSERT INTO wishlist_items (user_id, product_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, product_id) DO NOTHING
     RETURNING *`,
    [req.user.sub, req.params.productId]
  );
  res.status(201).json(rows[0] || { productId: req.params.productId });
}));

router.delete('/:productId', asyncHandler(async (req, res) => {
  await db.query('DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2', [req.user.sub, req.params.productId]);
  res.status(204).send();
}));

module.exports = router;

export {};
