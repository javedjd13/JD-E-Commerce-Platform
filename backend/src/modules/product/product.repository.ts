const db = require('../../database/db');

const sortMap = {
  price_asc: 'p.base_price ASC',
  price_desc: 'p.base_price DESC',
  popular: 'p.popularity_score DESC',
  newest: 'p.created_at DESC'
};

async function listProducts(filters, pagination) {
  const params = [];
  const where = ['p.is_active = TRUE'];

  if (filters.categoryId) {
    params.push(filters.categoryId);
    where.push(`p.category_id = $${params.length}`);
  }
  if (filters.minPrice) {
    params.push(filters.minPrice);
    where.push(`p.base_price >= $${params.length}`);
  }
  if (filters.maxPrice) {
    params.push(filters.maxPrice);
    where.push(`p.base_price <= $${params.length}`);
  }
  if (filters.rating) {
    params.push(filters.rating);
    where.push(`p.rating >= $${params.length}`);
  }
  if (filters.q) {
    params.push(filters.q);
    where.push(`p.search_vector @@ plainto_tsquery('english', $${params.length})`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderBy = sortMap[filters.sort] || sortMap.newest;
  const count = await db.query(`SELECT COUNT(*) FROM products p ${whereSql}`, params);

  params.push(pagination.limit, pagination.offset);
  const { rows } = await db.query(
    `SELECT p.*, c.name AS category_name,
            COALESCE(json_agg(DISTINCT pi.url) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images
     FROM products p
     JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_images pi ON pi.product_id = p.id
     ${whereSql}
     GROUP BY p.id, c.name
     ORDER BY ${orderBy}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { rows, total: count.rows[0].count };
}

async function findProductById(id) {
  const { rows } = await db.query(
    `SELECT p.*, c.name AS category_name,
            COALESCE(json_agg(DISTINCT pv) FILTER (WHERE pv.id IS NOT NULL), '[]') AS variants,
            COALESCE(json_agg(DISTINCT pi) FILTER (WHERE pi.id IS NOT NULL), '[]') AS images
     FROM products p
     JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_variants pv ON pv.product_id = p.id
     LEFT JOIN product_images pi ON pi.product_id = p.id
     WHERE p.id = $1
     GROUP BY p.id, c.name`,
    [id]
  );
  return rows[0] || null;
}

async function createProduct(input) {
  return db.transaction(async (client) => {
    const productResult = await client.query(
      `INSERT INTO products (name, slug, description, category_id, base_price, brand, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [input.name, input.slug, input.description, input.categoryId, input.basePrice, input.brand, input.isActive]
    );
    const product = productResult.rows[0];

    for (const variant of input.variants) {
      await client.query(
        `INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [product.id, variant.sku, variant.size, variant.color, variant.price, variant.stockQuantity]
      );
    }

    for (const image of input.images) {
      await client.query(
        `INSERT INTO product_images (product_id, url, alt_text, sort_order)
         VALUES ($1, $2, $3, $4)`,
        [product.id, image.url, image.altText, image.sortOrder]
      );
    }

    return product;
  });
}

async function updateProduct(id, input) {
  const { rows } = await db.query(
    `UPDATE products
     SET name = $1, slug = $2, description = $3, category_id = $4,
         base_price = $5, brand = $6, is_active = $7, updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [input.name, input.slug, input.description, input.categoryId, input.basePrice, input.brand, input.isActive, id]
  );
  return rows[0] || null;
}

async function deleteProduct(id) {
  await db.query('UPDATE products SET deleted_at = NOW(), is_active = FALSE WHERE id = $1', [id]);
}

module.exports = { listProducts, findProductById, createProduct, updateProduct, deleteProduct };

export {};
