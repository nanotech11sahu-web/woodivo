# WOODIVO Backend (NestJS + MongoDB)

Phase 1: Backend Foundation — config, database, security middleware, error handling,
response envelope, health check, and empty module stubs for all CMS-driven features.

## Setup

```bash
cp .env.example .env   # fill in real values
npm install
npm run start:dev
```

API base URL: `http://localhost:4000/api/v1`
Health check: `GET /api/v1/health`

## What's included in Phase 1

- Strict TypeScript config with path aliases (`@common`, `@config`, `@database`, `@modules`)
- Env validation via Joi (`src/config/env.validation.ts`) — app fails fast on missing/invalid env vars
- Typed configuration factory (`src/config/configuration.ts`)
- MongoDB connection via Mongoose (`src/database/database.module.ts`)
- Global exception filter with consistent error envelope, no plaintext error leakage
- Global response transform interceptor (consistent success envelope)
- Request logging interceptor
- Global ValidationPipe (whitelist + transform)
- Security middleware: helmet, compression, CORS (env-driven origins), rate limiting (Throttler)
- Health check endpoint backed by live Mongoose connection state
- Cloudinary connection provider (upload logic comes with Media module phase)
- Nodemailer transporter provider (send logic comes with Enquiries module phase)
- Empty module stubs wired into `AppModule` for: Auth, Users, Categories, Products,
  Enquiries, Blogs, Projects, Gallery, Testimonials, FAQs, Banners, Settings, SEO

## Not included yet (later phases)

- Mongoose schemas
- Auth (JWT strategy, guards, roles)
- CRUD endpoints for any module
- File upload endpoints
- Email sending logic
