const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const orders = require('./order.controller');

router.use(authenticate);
router.post('/razorpay/create', asyncHandler(orders.createRazorpayOrder));
router.post('/razorpay/verify', asyncHandler(orders.verifyRazorpayPayment));
router.post('/', asyncHandler(orders.createOrder));
router.get('/', asyncHandler(orders.listOrders));
router.get('/:orderId', asyncHandler(orders.getOrder));

module.exports = router;

export {};
