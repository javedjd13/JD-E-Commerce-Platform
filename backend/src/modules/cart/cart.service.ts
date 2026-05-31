const AppError = require('../../utils/AppError');
const cartRepository = require('./cart.repository');

async function getCart(userId) {
  return cartRepository.getCart(userId);
}

async function addItem(userId, input) {
  return cartRepository.addItem(userId, input);
}

async function updateItem(userId, itemId, quantity) {
  const item = await cartRepository.updateItem(userId, itemId, quantity);
  if (!item) throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
  return item;
}

async function removeItem(userId, itemId) {
  await cartRepository.removeItem(userId, itemId);
}

module.exports = { getCart, addItem, updateItem, removeItem };

export {};
