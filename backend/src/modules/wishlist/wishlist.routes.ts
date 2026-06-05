const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const wishlist = require('./wishlist.controller');

router.use(authenticate);
router.get('/', asyncHandler(wishlist.getWishlist));
router.post('/:productId', asyncHandler(wishlist.addToWishlist));
router.delete('/:productId', asyncHandler(wishlist.removeFromWishlist));

module.exports = router;

export {};
