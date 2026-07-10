# Learn Backend

Standalone Learn microservice powering the language-learning experience without depending on the rest of the Vibeon monorepo.

## Features
- Express API (courses, lessons, progress, AI prompts, translation) backed by Prisma + PostgreSQL.
- Lightweight JWT-based authentication and seed data for a quick start.
- Simple translation helper that can forward requests to any translator API via `TRANSLATOR_API_URL`.
- Dedicated translator endpoints (health, languages, detection, and translation) that reuse any running `vibeon_translator` instance for richer language tooling.

## Quick Start
1. Copy `.env.example` to `.env` and edit the values:
   ```bash
   cd learn/backend
   cp .env.example .env
   ```
2. Install dependencies & generate Prisma client:
   ```bash
   npm install
   npm run prisma:generate
   ```
3. Populate the database with sample data:
   ```bash
   npm run prisma:seed
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
5. The API is available at `http://localhost:4100/api`.

## Structure
- `src/` – Express entry point (`index.js`), controllers, services, trusted middleware, and validation schemas.
- `prisma/` – Schema and seed script for courses, lessons, progress, and users.
- `.env.example` – Database credentials, JWT secret, and translator settings.

Use this service as a standalone backend for the Learn frontend under `learn/frontend` or deploy it independently wherever a modern project needs a language learning API.
