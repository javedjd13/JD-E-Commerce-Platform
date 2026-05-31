const db = require('../../database/db');

function mapEvent(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    city: row.city,
    venue: row.venue,
    category: row.category,
    startsAt: row.starts_at,
    imageUrl: row.image_url,
    minPrice: Number(row.min_price || 0),
    tiers: row.tiers || []
  };
}

async function listEvents(filters) {
  const params = [];
  const where = ['e.is_active = TRUE'];

  if (filters.city) {
    params.push(filters.city);
    where.push(`LOWER(e.city) = LOWER($${params.length})`);
  }

  if (filters.category) {
    params.push(filters.category);
    where.push(`LOWER(e.category) = LOWER($${params.length})`);
  }

  if (filters.date) {
    params.push(filters.date);
    where.push(`DATE(e.starts_at) = $${params.length}`);
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    where.push(`(e.title ILIKE $${params.length} OR e.venue ILIKE $${params.length})`);
  }

  const { rows } = await db.query(
    `SELECT e.*, COALESCE(MIN(t.price), 0) AS min_price
     FROM events e
     LEFT JOIN event_ticket_tiers t ON t.event_id = e.id
     WHERE ${where.join(' AND ')}
     GROUP BY e.id
     ORDER BY e.starts_at ASC`,
    params
  );

  return rows.map(mapEvent);
}

async function getEventById(id) {
  const { rows } = await db.query(
    `SELECT e.*,
            COALESCE(MIN(t.price), 0) AS min_price,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', t.id,
                  'name', t.name,
                  'price', t.price,
                  'capacity', t.capacity,
                  'available', GREATEST(t.capacity - t.sold_count, 0)
                )
                ORDER BY t.price
              ) FILTER (WHERE t.id IS NOT NULL),
              '[]'
            ) AS tiers
     FROM events e
     LEFT JOIN event_ticket_tiers t ON t.event_id = e.id
     WHERE e.id = $1 AND e.is_active = TRUE
     GROUP BY e.id`,
    [id]
  );

  return rows[0] ? mapEvent(rows[0]) : null;
}

module.exports = { listEvents, getEventById };

export {};
