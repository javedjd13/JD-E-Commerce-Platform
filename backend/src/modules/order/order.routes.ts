const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const orders = require('./order.controller');

router.use(authenticate);
router.post('/', asyncHandler(orders.createOrder));
router.get('/', asyncHandler(orders.listOrders));

module.exports = router;

export {};
