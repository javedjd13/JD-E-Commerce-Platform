const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const db = require('../../database/db');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', asyncHandler(async (req, res) => {
  const [users, products, orders] = await Promise.all([
    db.query('SELECT COUNT(*) FROM users'),
    db.query('SELECT COUNT(*) FROM products WHERE deleted_at IS NULL'),
    db.query('SELECT COUNT(*) FROM orders')
  ]);

  res.json({
    users: Number(users.rows[0].count),
    products: Number(products.rows[0].count),
    orders: Number(orders.rows[0].count)
  });
}));

module.exports = router;

export {};
