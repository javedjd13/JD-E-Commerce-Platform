const AppError = require('../../utils/AppError');
const { getPagination, paginated } = require('../../utils/pagination');
const productRepository = require('./product.repository');

async function list(query) {
  const pagination = getPagination(query);
  const result = await productRepository.listProducts(query, pagination);
  return paginated(result.rows, result.total, pagination.page, pagination.limit);
}

async function detail(id) {
  const product = await productRepository.findProductById(id);
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  return product;
}

async function create(input) {
  return productRepository.createProduct(input);
}

async function update(id, input) {
  const product = await productRepository.updateProduct(id, input);
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  return product;
}

async function remove(id) {
  await productRepository.deleteProduct(id);
}

module.exports = { list, detail, create, update, remove };

export {};
