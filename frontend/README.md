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

- `VITE_CHOREO_BASE_URL=http://localhost:8080`

## Current Routes

- `/overview`
- `/runs`
- `/runs/:runId`
- `/events`
- `/functions`

## Available Backend Calls (typed)

- `GET /health`
- `GET /runs/:id`
- `GET /runs/:id/steps`
- `POST /runs/:id/cancel`
