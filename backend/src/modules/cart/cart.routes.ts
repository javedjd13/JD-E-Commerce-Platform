const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const cart = require('./cart.controller');

router.use(authenticate);
router.get('/', asyncHandler(cart.getCart));
router.post('/', asyncHandler(cart.addToCart));
router.put('/', asyncHandler(cart.updateCart));
router.delete('/:productId', asyncHandler(cart.removeFromCart));

module.exports = router;

export {};
