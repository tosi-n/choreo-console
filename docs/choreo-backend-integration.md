# Choreo Backend Integration (GHCR Container)

This repository uses the published Choreo server container from GHCR for backend bring-up:

- `ghcr.io/tosi-n/choreo`

The goal is to provide a stable local backend target for the console while frontend work proceeds.

## Included in this repo

- `docker-compose.yml`
  - runs Choreo server on `http://localhost:8080`
  - uses SQLite persistence in a named volume
  - includes container healthcheck
- `.env.example`
  - image tag and port overrides
- `scripts/start-backend.sh`
  - starts Choreo and waits for `/health`

## Quick Start

1. Copy env defaults:

```bash
cp .env.example .env
```

2. Start backend:

```bash
./scripts/start-backend.sh
```

3. Verify health:

```bash
curl http://localhost:8080/health
```

Expected response:

```json
{"status":"ok","database":"healthy"}
```

## Why GHCR-first

- avoids requiring local Rust toolchain for every console contributor
- keeps setup consistent with existing production-like patterns
- allows pinning Choreo versions for reproducible local environments

## Next backend tasks (from PRD)

- add `GET /runs` list/filter endpoint in Choreo backend
- add `GET /events` list endpoint
- add `GET /runs/stats` for overview metrics
- then consume these from console frontend

