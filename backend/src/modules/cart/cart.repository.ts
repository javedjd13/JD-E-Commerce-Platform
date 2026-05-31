const db = require('../../database/db');

async function getOrCreateCart(userId) {
  const existing = await db.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  if (existing.rows[0]) return existing.rows[0];

  const created = await db.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
  return created.rows[0];
}

async function getCart(userId) {
  const cart = await getOrCreateCart(userId);
  const { rows } = await db.query(
    `SELECT ci.id, ci.quantity, ci.created_at,
            pv.id AS product_variant_id, pv.sku, pv.size, pv.color, pv.price,
            p.id AS product_id, p.name, p.slug
     FROM cart_items ci
     JOIN product_variants pv ON pv.id = ci.product_variant_id
     JOIN products p ON p.id = pv.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.created_at DESC`,
    [cart.id]
  );
  return { ...cart, items: rows };
}

async function addItem(userId, { productVariantId, quantity }) {
  const cart = await getOrCreateCart(userId);
  const { rows } = await db.query(
    `INSERT INTO cart_items (cart_id, product_variant_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, product_variant_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()
     RETURNING *`,
    [cart.id, productVariantId, quantity]
  );
  return rows[0];
}

async function updateItem(userId, itemId, quantity) {
  const cart = await getOrCreateCart(userId);
  const { rows } = await db.query(
    `UPDATE cart_items SET quantity = $1, updated_at = NOW()
     WHERE id = $2 AND cart_id = $3
     RETURNING *`,
    [quantity, itemId, cart.id]
  );
  return rows[0] || null;
}

async function removeItem(userId, itemId) {
  const cart = await getOrCreateCart(userId);
  await db.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cart.id]);
}

module.exports = { getCart, addItem, updateItem, removeItem };

export {};
