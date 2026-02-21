#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

echo "Starting Choreo backend container..."
docker compose up -d choreo

echo "Waiting for Choreo health endpoint..."
for _ in {1..30}; do
  if curl -fsS "http://localhost:${CHOREO_SERVER_PORT:-8080}/health" >/dev/null; then
    echo "Choreo is healthy at http://localhost:${CHOREO_SERVER_PORT:-8080}"
    exit 0
  fi
  sleep 1
done

echo "Choreo did not become healthy in time."
docker compose logs --tail=100 choreo || true
exit 1

