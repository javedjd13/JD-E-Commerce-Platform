const router = require('express').Router();
const Joi = require('joi');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');
const db = require('../../database/db');

const createBookingSchema = Joi.object({
  eventId: Joi.string().uuid().required(),
  ticketTierId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).max(10).required(),
  attendeeName: Joi.string().max(160).required(),
  attendeeEmail: Joi.string().email().required()
});

router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT b.id, b.quantity, b.status, b.payment_status, b.total_amount, b.created_at,
            e.id AS event_id, e.title, e.city, e.venue, e.starts_at, e.image_url,
            t.name AS tier_name
     FROM bookings b
     JOIN events e ON e.id = b.event_id
     JOIN event_ticket_tiers t ON t.id = b.ticket_tier_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [req.user.sub]
  );

  res.json(rows.map((row) => ({
    id: row.id,
    quantity: row.quantity,
    status: row.status,
    paymentStatus: row.payment_status,
    totalAmount: Number(row.total_amount),
    createdAt: row.created_at,
    event: {
      id: row.event_id,
      title: row.title,
      city: row.city,
      venue: row.venue,
      startsAt: row.starts_at,
      imageUrl: row.image_url
    },
    tierName: row.tier_name
  })));
}));

router.post('/', validate(createBookingSchema), asyncHandler(async (req, res) => {
  const booking = await db.transaction(async (client) => {
    const tierResult = await client.query(
      `SELECT t.*, e.id AS event_id
       FROM event_ticket_tiers t
       JOIN events e ON e.id = t.event_id
       WHERE t.id = $1 AND e.id = $2 AND e.is_active = TRUE
       FOR UPDATE`,
      [req.body.ticketTierId, req.body.eventId]
    );

    const tier = tierResult.rows[0];
    if (!tier) throw new AppError('Ticket tier not found', 404, 'TIER_NOT_FOUND');
    if (tier.capacity - tier.sold_count < req.body.quantity) {
      throw new AppError('Not enough tickets available', 409, 'INSUFFICIENT_TICKETS');
    }

    const total = Number(tier.price) * req.body.quantity;

    await client.query(
      'UPDATE event_ticket_tiers SET sold_count = sold_count + $1 WHERE id = $2',
      [req.body.quantity, tier.id]
    );

    const { rows } = await client.query(
      `INSERT INTO bookings
       (user_id, event_id, ticket_tier_id, quantity, attendee_name, attendee_email, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.sub,
        req.body.eventId,
        req.body.ticketTierId,
        req.body.quantity,
        req.body.attendeeName,
        req.body.attendeeEmail,
        total
      ]
    );

    return rows[0];
  });

  res.status(201).json({
    id: booking.id,
    status: booking.status,
    paymentStatus: booking.payment_status,
    totalAmount: Number(booking.total_amount)
  });
}));

module.exports = router;

export {};
