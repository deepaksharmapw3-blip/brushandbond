# Retired PostgreSQL backend

This directory is archived historical code and is not part of the supported application. Do not deploy it, seed a database from it, or use its API. Its routes, schema, and data model are not maintained alongside the app.

The supported application is the repository root Vite frontend plus the SQLite API in `server/index.js`:

1. Configure root `.env` using the root `.env.example`.
2. Start the API from the repository root with `npm run api`.
3. Start the frontend from the repository root with `npm run dev`.

The legacy `backend/index.js` intentionally exits with a retirement notice. Historical authentication middleware also fails closed unless `JWT_SECRET` is configured with at least 32 characters, and cross-origin requests are denied unless an exact origin is listed in `CORS_ORIGINS`.
