const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth');
const auth = require('./auth.controller');

router.post('/register', asyncHandler(auth.register));
router.post('/signup', asyncHandler(auth.register));
router.post('/login', asyncHandler(auth.login));
router.post('/logout', asyncHandler(auth.logout));
router.get('/me', authenticate, asyncHandler(auth.me));
router.patch('/me', authenticate, asyncHandler(auth.updateProfile));
router.post('/me/addresses', authenticate, asyncHandler(auth.createAddress));
router.put('/me/addresses/:addressId', authenticate, asyncHandler(auth.updateAddress));
router.delete('/me/addresses/:addressId', authenticate, asyncHandler(auth.deleteAddress));

module.exports = router;

export {};
