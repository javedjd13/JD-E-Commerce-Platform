const router = require('express').Router();
const Joi = require('joi');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const AppError = require('../../utils/AppError');
const repository = require('./event.repository');

const listSchema = Joi.object({
  city: Joi.string().max(100),
  category: Joi.string().max(80),
  date: Joi.date().iso(),
  search: Joi.string().max(120)
});

router.get('/', validate(listSchema, 'query'), asyncHandler(async (req, res) => {
  const events = await repository.listEvents(req.query);
  res.json(events);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const event = await repository.getEventById(req.params.id);
  if (!event) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  res.json(event);
}));

module.exports = router;

export {};
