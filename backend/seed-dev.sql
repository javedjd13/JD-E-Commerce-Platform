INSERT INTO categories (name, slug, description)
VALUES ('Shoes', 'shoes', 'All shoes')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
RETURNING id;

WITH category AS (
  SELECT id FROM categories WHERE slug = 'shoes'
),
product AS (
  INSERT INTO products (category_id, name, slug, description, brand, base_price)
  SELECT id, 'Nike Runner', 'nike-runner', 'Running shoes', 'Nike', 2999
  FROM category
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
)
INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity)
SELECT id, 'NIKE-RUN-BLK-9', '9', 'Black', 2999, 10
FROM product
ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity
RETURNING id;

INSERT INTO banners (title, image_url, link_url, sort_order)
VALUES ('Summer Sale', 'https://example.com/banner.jpg', '/products?category=shoes', 1)
RETURNING id;

INSERT INTO events (title, slug, description, city, venue, category, starts_at, image_url)
VALUES
  (
    'Skyline Indie Night',
    'skyline-indie-night',
    'An open-air indie music evening featuring emerging bands, food pop-ups, and a relaxed rooftop crowd.',
    'Bengaluru',
    'Orion Rooftop Arena',
    'Music',
    NOW() + INTERVAL '9 days',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Punchline Friday',
    'punchline-friday',
    'A sharp stand-up showcase with touring comics and fast-paced crowd work in an intimate club setting.',
    'Mumbai',
    'The Laugh Loft',
    'Comedy',
    NOW() + INTERVAL '13 days',
    'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Maker Market Weekend',
    'maker-market-weekend',
    'Design-led stalls, creative workshops, live demos, and independent food brands across a two-day market.',
    'Delhi',
    'Foundry Hall',
    'Workshop',
    NOW() + INTERVAL '17 days',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO event_ticket_tiers (event_id, name, price, capacity)
SELECT e.id, tier.name, tier.price, tier.capacity
FROM events e
JOIN (
  VALUES
    ('skyline-indie-night', 'Early Bird', 799, 80),
    ('skyline-indie-night', 'VIP Deck', 1499, 30),
    ('punchline-friday', 'General', 499, 100),
    ('punchline-friday', 'Front Row', 899, 24),
    ('maker-market-weekend', 'Day Pass', 299, 200),
    ('maker-market-weekend', 'Workshop Bundle', 999, 40)
) AS tier(slug, name, price, capacity) ON tier.slug = e.slug
WHERE NOT EXISTS (
  SELECT 1 FROM event_ticket_tiers existing
  WHERE existing.event_id = e.id AND existing.name = tier.name
);
