# choreo-console

Frontend console for Choreo.

## Backend (GHCR)

Run Choreo backend locally from GHCR:

```bash
cp .env.example .env
./scripts/start-backend.sh
```

Health check:

```bash
curl http://localhost:8080/health
```

See `/Users/tosi-n/Documents/Dev/ai-engineer/workspace/choreo-console/docs/choreo-backend-integration.md` for details.

## Frontend Foundation

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Typecheck/build:

```bash
cd frontend
npm run build
npm run lint
```
