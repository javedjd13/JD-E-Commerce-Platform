const router = require('express').Router();
const asyncHandler = require('../../utils/asyncHandler');
const products = require('./product.controller');

router.get('/', asyncHandler(products.listProducts));
router.get('/:id', asyncHandler(products.getProduct));

module.exports = router;

export {};
