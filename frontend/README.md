# Choreo Console Frontend

Frontend foundation for Choreo Console using:

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zod-validated typed API client

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Default backend URL:

- `VITE_CHOREO_BASE_URL=/api` (recommended for local dev via Vite proxy)

Notes:

- The Vite dev server proxies `/api/*` to `http://localhost:8080`.
- This avoids browser CORS issues when Choreo is running without CORS headers.
- If you need direct access to another environment, set an absolute URL instead.

## Current Routes

- `/overview`
- `/runs`
- `/runs/:runId`
- `/events`
- `/events/:eventId`
- `/functions`

## Available Backend Calls (typed)

- `GET /health`
- `GET /functions`
- `GET /runs`
- `GET /events`
- `GET /events/:id`
- `POST /events`
- `GET /runs/:id`
- `GET /runs/:id/steps`
- `POST /runs/:id/cancel`
