# Choreo Console PRD (React + TypeScript + Vite)

## 1) Product Goal

Build a first-party Choreo dashboard that closes the loop from orchestration backend to operational UI, so teams can:

- deploy and manage workflow functions
- observe runs/events in real time
- debug failures quickly
- recover safely (replay/cancel/pause)

End state: Choreo offers a full-stack experience comparable to Inngest Cloud for core workflow operations.

## 2) Scope Definition

### In Scope (V1)

- Environment-level dashboard for runs, events, functions, and health
- Search/filtering for runs and events
- Run/event detail views with step-level execution insight
- Operational actions: single cancel, bulk cancel, replay, pause/resume (if backend supports)
- Metrics overview (status mix, throughput, backlog)
- TypeScript-only frontend in React + Vite

### Out of Scope (V1)

- Full SQL insights editor (Inngest Insights equivalent)
- Multi-org billing/admin features
- SSO/SAML enterprise access controls
- AI trace metadata parity

## 3) Inngest Benchmark (What To Emulate)

Based on current Inngest docs/site, these are the relevant dashboard capabilities:

- Apps model and app management:
  - apps map to projects/services
  - apps per environment
  - sync history, diagnostics, archive/unarchive
- Observability:
  - function list with triggers, failure rate, volume
  - function metrics charts (status/failures/throughput/backlog)
  - event metrics and logs
  - global search (`Cmd/Ctrl + K`)
- Runs and events operations:
  - runs list with status/time/app filters + CEL advanced search
  - events list with time filter + CEL advanced search
  - run details with timeline, step retries/errors, event payload
  - rerun from run details
  - send trigger event to local dev server
- Reliability tooling:
  - bulk replay
  - bulk cancellation
  - function pausing/resuming
- Tracing:
  - built-in timeline/log/retry traces in run details
  - AI traces and extended OTel traces

## 4) Choreo Current State (Backend Audit)

Current Choreo HTTP API exposes:

- `POST /events`, `GET /events/:id`
- `GET /runs/:id`, `POST /runs/:id/cancel`, `POST /runs/:id/complete`, `POST /runs/:id/fail`
- `GET /runs/:id/steps`, `POST /runs/:id/steps/:step_id`
- `POST /worker/lease-runs`, `POST /worker/heartbeat`
- `POST /functions`, `GET /functions`
- `GET /health`

Current storage schema already contains strong primitives:

- `events`
- `function_runs` (status, attempt, max_attempts, lock metadata, `run_after`, `concurrency_key`)
- `step_runs`
- `functions`
- `distributed_locks`

Important finding: storage layer already supports list/pagination queries (`get_events_by_name`, `get_runs_by_function`, `get_runs_by_event`, stale run queries), but most are not exposed as dashboard-friendly HTTP endpoints yet.

## 5) Gap Analysis (Choreo vs Inngest-Like Console)

### Core Gaps

- No run listing endpoint (only get by ID)
- No event listing endpoint (only get by ID)
- No function detail endpoint (only list all)
- No aggregate metrics endpoint (status distribution, throughput, backlog)
- No replay API
- No bulk cancel API
- No pause/resume semantics for functions
- No environment/app abstraction in API
- No worker observability endpoint (active workers, last heartbeat)
- No global search endpoint

### Secondary Gaps

- No built-in auth/RBAC surface for dashboard access
- No SSE/WebSocket stream for live run/event updates
- No dedicated traces/logs API surface (beyond step data)

## 6) Product Requirements (V1)

### 6.1 Dashboard Information Architecture

- `/overview`
- `/runs`
- `/runs/:id`
- `/events`
- `/events/:id`
- `/functions`
- `/functions/:id`
- `/ops/replays` (optional in phase 2/3)
- `/ops/cancellations` (optional in phase 2/3)

### 6.2 Runs

Must have:

- table with columns: run id, function id, event id, status, attempt/max, created/started/ended, duration
- filters: status, function, created time range
- search: id/function/event id exact; payload text optional
- row action: cancel (when running/queued)
- detail page: event payload, run metadata, step timeline, step outputs/errors

Acceptance criteria:

- Operator can find failed runs in < 30 seconds
- Operator can inspect retries and failing step quickly

### 6.3 Events

Must have:

- table with columns: event id, name, timestamp, user_id, idempotency key
- filters: event name, time range
- detail page: raw payload + linked triggered runs

Acceptance criteria:

- Operator can trace event -> runs path in one click

### 6.4 Functions

Must have:

- function list with trigger info and runtime config:
  - triggers
  - retries
  - concurrency
  - throttle/debounce
  - priority
- function detail:
  - recent runs
  - failure rate and throughput snapshots
  - actions (phase 2): pause/resume, replay range, bulk cancel

Acceptance criteria:

- Operator can detect top failing functions from one screen

### 6.5 Overview

Must have:

- KPI cards:
  - queued
  - running
  - failed (24h)
  - completed (24h)
- charts:
  - runs by status over time
  - throughput over time
  - backlog over time
- top failing functions list

Acceptance criteria:

- Team can detect incident signal (failure spike/backlog growth) at a glance

## 7) Required Backend API Additions

Recommended endpoints to add in Choreo:

- `GET /runs`
  - query: `status[]`, `function_id`, `event_id`, `created_from`, `created_to`, `limit`, `cursor|offset`
- `GET /runs/stats`
  - returns status counts + throughput buckets + backlog buckets
- `POST /runs/bulk-cancel`
  - filter-based cancellation and job id
- `POST /runs/replay`
  - single run replay
- `POST /runs/bulk-replay`
  - filter-based replay and job id
- `GET /events`
  - query: `name`, `user_id`, `time range`, pagination
- `GET /events/:id/runs`
  - runs linked to event
- `GET /functions/:id`
  - resolved function definition + rollups
- `POST /functions/:id/pause`
- `POST /functions/:id/resume`
- `GET /workers`
  - active workers, leased runs, last heartbeat
- `GET /search`
  - lightweight global search over runs/events/functions ids/names

## 8) Frontend Technical Requirements

### 8.1 Stack

- Vite + React + TypeScript (strict mode)
- React Router for app navigation
- TanStack Query for server state
- Zustand (or context) for minimal UI state
- Charting: Recharts or ECharts
- Table: TanStack Table

### 8.2 Frontend Architecture

- `src/pages/*` route-level pages
- `src/features/runs|events|functions|overview/*`
- `src/api/client.ts` typed fetch wrapper
- `src/api/contracts.ts` shared DTOs and zod validators
- `src/components/ui/*` design system primitives

### 8.3 Quality Requirements

- Type-safe API contracts (runtime validation for server responses)
- Loading/empty/error states on all data panels
- Keyboard-first filtering/search UX
- Mobile and desktop responsive layouts
- Test coverage:
  - unit tests for adapters/selectors
  - integration tests for data screens
  - basic E2E smoke for critical flows (runs list -> run detail -> cancel)

### 8.4 Performance Targets

- first meaningful paint < 2.5s on local broadband
- run/event table interactions < 150ms perceived latency
- list pages support 10k+ records via pagination/infinite loading

## 9) Delivery Plan

### Phase 0: Foundation (1 week)

- initialize Vite React TS project
- app shell, routing, base UI primitives
- API client abstraction and auth token support

### Phase 1: Observability MVP (2 weeks)

- overview page
- runs list + run details + single cancel
- events list + event details
- functions list (read-only)

### Phase 2: Operational Controls (2 weeks)

- function details
- bulk cancel flow
- replay flow (single + bulk if backend ready)
- pause/resume flow (if backend ready)

### Phase 3: Advanced Experience (2 weeks)

- global search
- live updates (polling -> SSE/WebSocket if available)
- worker observability panel
- hardening and UX polish

## 10) Success Metrics

- MTTR reduction: time from failure detection to remediation
- % failed runs that get replayed/canceled from UI vs manual DB/API ops
- median time to locate a run from event id
- dashboard adoption: weekly active operators

## 11) Open Decisions

- Auth model for Choreo console (none/token/JWT+RBAC)
- Multi-environment model shape in Choreo API
- Replay semantics in Choreo:
  - clone run with same input?
  - replay from failed step or from start?
- Data retention and pagination strategy for large histories

## 12) Source References

- Inngest homepage: https://www.inngest.com/
- Observability & metrics: https://www.inngest.com/docs/platform/monitor/observability-metrics
- Inspecting runs: https://www.inngest.com/docs/platform/monitor/inspecting-function-runs
- Inspecting events: https://www.inngest.com/docs/platform/monitor/inspecting-events
- Traces: https://www.inngest.com/docs/platform/monitor/traces
- Insights: https://www.inngest.com/docs/platform/monitor/insights
- Apps concept: https://www.inngest.com/docs/apps
- Apps management: https://www.inngest.com/docs/platform/manage/apps
- Bulk cancellation: https://www.inngest.com/docs/platform/manage/bulk-cancellation
- Replay: https://www.inngest.com/docs/platform/replay
- Pausing: https://www.inngest.com/docs/guides/pause-functions
- Connect worker observability: https://www.inngest.com/docs/setup/connect
- Changelog (event history explorer): https://www.inngest.com/changelog/2025-06-05-new-event-history-explorer
