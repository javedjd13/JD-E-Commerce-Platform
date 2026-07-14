const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate, optionalAuthenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { loginSchema, signupSchema } = require('./auth.validation');
const auth = require('./auth.controller');

router.post('/register', validate(signupSchema), asyncHandler(auth.register));
router.post('/signup', validate(signupSchema), asyncHandler(auth.register));
router.post('/login', validate(loginSchema), asyncHandler(auth.login));
router.post('/logout', asyncHandler(auth.logout));
router.get('/me', optionalAuthenticate, asyncHandler(auth.me));
router.patch('/me', authenticate, asyncHandler(auth.updateProfile));
router.post('/me/addresses', authenticate, asyncHandler(auth.createAddress));
router.put('/me/addresses/:addressId', authenticate, asyncHandler(auth.updateAddress));
router.delete('/me/addresses/:addressId', authenticate, asyncHandler(auth.deleteAddress));

module.exports = router;

export {};
