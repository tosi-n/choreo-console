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
- `VITE_STIMULIR_BASE_URL=http://localhost:8000/api/v1` (optional, for historical run data)
- `VITE_STIMULIR_AUTH_TOKEN=` (optional; required for authenticated Stimulir endpoints)

Notes:

- The Vite dev server proxies `/api/*` to `http://localhost:8080`.
- This avoids browser CORS issues when Choreo is running without CORS headers.
- If you need direct access to another environment, set an absolute URL instead.

## Current Routes

- `/overview`
- `/runs`
- `/runs/:runId`
- `/events`
- `/functions`

## Available Backend Calls (typed)

- `GET /health`
- `GET /functions`
- `POST /events`
- `GET /runs/:id`
- `GET /runs/:id/steps`
- `POST /runs/:id/cancel`

Current backend note (`ghcr.io/tosi-n/choreo:0.1.4`):

- Run and event list endpoints (`GET /runs`, `GET /events`) are not exposed in this image.
- For real historical run rows, use Stimulir endpoints (`GET /api/v1/admin/traces`, `GET /api/v1/worker/status`) with auth token.
