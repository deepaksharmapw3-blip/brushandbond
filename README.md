# Brush and Bond

Brush and Bond is the art club site and artwork archive for the Government College of Engineering and Ceramic Technology (GCECT). The frontend is a React, TypeScript, and Vite app. The API is a small Node.js service with SQLite persistence.

## Run locally

Requirements: Node.js 24 or newer and npm.

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env`, then set a private `ADMIN_EMAIL` and a long, unique `ADMIN_PASSWORD`.
3. In one terminal run `npm run api`.
4. In another terminal run `npm run dev` and open the Vite URL it prints.

The Vite development server forwards `/api` and `/uploads` to the API on port 3002. The API reports its health at `http://127.0.0.1:3002/api/health`.

## Persistence and security

The server creates `data/brushandbond.sqlite` on first start and seeds the existing artworks, events, artists, achievements, and team records. Contact messages, membership applications, event registrations, likes, announcements, and admin edits are stored server-side. Uploaded artwork images are written to `uploads/`. Keep the database and uploads directory together and include both in backups; both are ignored by Git.

Admin sessions use an HttpOnly, SameSite=Strict cookie and expire after 12 hours. Set `NODE_ENV=production` when serving over HTTPS so the cookie is marked Secure. The admin API is disabled until server credentials are configured. No demo account or client-side password is shipped.

For deployment, host the API and frontend on the same site origin or configure a reverse proxy for `/api` and `/uploads`. Use persistent disk storage for `DATABASE_PATH` and the uploads directory. Back up both. Do not expose the development Vite server to the public internet.

## Commands

- `npm run dev` — Vite development frontend
- `npm run api` — persistent API server on port 3002
- `npm run build` — TypeScript and production frontend build
- `npm run lint` — Oxlint
