# Full Stack E-Commerce Website

A full stack e-commerce web application built with a Next.js frontend and an Express/TypeScript backend. The app includes product browsing, authentication, cart management, order flow, profile handling, and seeded demo products for a shopping-style user experience.

## Features

- Product listing, product details, category-based browsing, featured rails, top-rated products, and best-deal sections
- User registration, login, logout, and authenticated profile APIs
- Cookie-based JWT authentication with httpOnly cookies
- Cart APIs for add, update, view, and remove operations
- Order creation and order history APIs
- PostgreSQL database integration with Prisma models and seed data
- Frontend state/data handling with React Query, Redux Toolkit, and persisted cart state
- Responsive UI built with Tailwind CSS, Radix primitives, and Lucide icons
- Event booking files are also present in the codebase, with mock checkout/payment UI

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- TanStack React Query
- Redux Toolkit
- redux-persist
- Radix UI Slot
- Lucide React

### Backend

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma
- JWT authentication
- bcryptjs password hashing
- Joi validation
- Helmet, CORS, Morgan, Winston

## Project Structure

```text
.
+-- backend/
|   +-- prisma/
|   |   +-- schema.prisma
|   |   +-- seed.ts
|   +-- src/
|   |   +-- config/
|   |   +-- database/
|   |   +-- middleware/
|   |   +-- modules/
|   |   |   +-- auth/
|   |   |   +-- product/
|   |   |   +-- cart/
|   |   |   +-- order/
|   |   |   +-- user/
|   |   |   +-- event/
|   |   |   +-- booking/
|   |   |   +-- wishlist/
|   |   +-- app.ts
|   |   +-- routes.ts
|   |   +-- server.ts
|   +-- package.json
|
+-- frontend/
    +-- src/
    |   +-- app/
    |   +-- components/
    |   +-- features/
    |   +-- hooks/
    |   +-- lib/
    |   +-- services/
    |   +-- store/
    |   +-- types/
    +-- package.json
```

## Prerequisites

- Node.js 20 or newer recommended
- npm
- PostgreSQL database

## Environment Variables

Create `backend/.env` from the example file:

```bash
cd backend
copy .env.example .env
```

Backend environment:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ecommerce
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_ACCESS_EXPIRES_IN=7d
```

Frontend can use this optional environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

If it is not set, the frontend defaults to `http://localhost:4000/api/v1`.

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Database Setup

From the `backend` folder:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

The seed script creates demo products and a demo user:

```text
Email: javed@example.com
Password: Password123!
```

## Running Locally

Start the backend API:

```bash
cd backend
npm run dev
```

Backend runs on:

```text
http://localhost:4000
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

## Useful Scripts

### Backend

```bash
npm run dev          # Start backend in development mode
npm run build        # Compile TypeScript
npm run start        # Run compiled backend
npm run typecheck    # TypeScript type check
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run Prisma migrations
npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed demo data
npm run lint         # Run ESLint
```

### Frontend

```bash
npm run dev          # Start Next.js dev server
npm run build        # Build production frontend
npm run start        # Start production frontend
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type check
```

## API Overview

Base API URL:

```text
http://localhost:4000/api/v1
```

Currently mounted backend routes:

```text
POST   /auth/register
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
GET    /auth/me
PATCH  /auth/me

GET    /products
GET    /products/:id

GET    /cart
POST   /cart
PUT    /cart
DELETE /cart/:productId

POST   /orders
GET    /orders

GET    /users/me
PATCH  /users/me
GET    /users/me/addresses
POST   /users/me/addresses
PUT    /users/me/addresses/:addressId
DELETE /users/me/addresses/:addressId
```

Health check:

```text
GET /health
```

## Auth Flow

- Register or login through `/api/v1/auth/register` or `/api/v1/auth/login`
- Backend returns user data and sets an `accessToken` httpOnly cookie
- Protected APIs read the JWT from the cookie
- Frontend sends requests with `credentials: include`

## Important Note

The frontend contains event and booking screens, and backend files for `event`, `booking`, `banner`, `category`, and `wishlist` modules are present. In the current `backend/src/routes.ts`, only `auth`, `products`, `cart`, `orders`, and `users` are mounted. If you want event booking and wishlist features to work through the API, mount those route files in `backend/src/routes.ts`.

## Build Check

Run these commands before deployment:

```bash
cd backend
npm run typecheck
npm run build

cd ../frontend
npm run typecheck
npm run build
```

## Deployment Notes

- Set `NODE_ENV=production`
- Use a strong `JWT_ACCESS_SECRET`
- Set `DATABASE_URL` to the production PostgreSQL URL
- Set `CORS_ORIGIN` to the deployed frontend URL
- Set `NEXT_PUBLIC_API_URL` to the deployed backend API URL
- Run Prisma migration/generation during deployment
