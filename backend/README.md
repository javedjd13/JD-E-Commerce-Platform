# Ticket Booking API

Production-oriented ticket booking API using Express, TypeScript, PostgreSQL, bcrypt password hashing, and JWT httpOnly cookie auth.

## Quick Start

```bash
npm.cmd install
copy .env.example .env
npm.cmd run db:migrate
psql "%DATABASE_URL%" -f seed-dev.sql
npm.cmd run dev
```

## Structure

```text
src/
  config/          environment and logger config
  database/        SQL schema and PostgreSQL pool
  middleware/      auth, validation, errors, request logging
  modules/         feature modules with route/controller/service/repository layers
  utils/           shared helpers
  app.ts           Express app composition
  server.ts        process/bootstrap boundary
```

## API Examples

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/me`
- `PATCH /api/v1/me`
- `GET /api/v1/events?city=Bengaluru&category=Music&date=2026-05-10`
- `GET /api/v1/events/:id`
- `POST /api/v1/bookings`
- `GET /api/v1/bookings`

## Auth

Register/login sets an `accessToken` httpOnly cookie. Protected endpoints verify the JWT from that cookie and attach the user to `req.user`.

See `src/database/schema.sql` for normalized tables, relationships, and indexes.
