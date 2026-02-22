import { z } from 'zod'

import {
  eventsResponseSchema,
  eventResponseSchema,
  functionsResponseSchema,
  healthResponseSchema,
  runsResponseSchema,
  runResponseSchema,
  runStepsResponseSchema,
  sendEventResponseSchema,
  type EventResponse,
  type FunctionDefinition,
  type HealthResponse,
  type RunResponse,
  type SendEventResponse,
  type StepResponse,
} from './schemas'

export class ChoreoApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ChoreoApiError'
    this.status = status
  }
}

type ChoreoClientOptions = {
  baseUrl?: string
}

export type SendEventInput = {
  name: string
  data: Record<string, unknown>
  idempotency_key?: string
  user_id?: string
}

export type RunsParams = {
  limit?: number
  offset?: number
  status?: string
  function_id?: string
  event_id?: string
}

export type EventsParams = {
  limit?: number
  offset?: number
  name?: string
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`
}

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function buildRequestUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (isAbsoluteHttpUrl(baseUrl)) {
    const absolute = new URL(normalizedPath.replace(/^\//, ''), ensureTrailingSlash(baseUrl))
    return absolute.toString()
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  return `${normalizedBase}${normalizedPath}`
}

async function parseResponseJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown
  } catch {
    return null
  }
}

function parseErrorMessage(payload: unknown): string {
  const parsed = z
    .object({
      error: z.string().optional(),
      detail: z.string().optional(),
      message: z.string().optional(),
    })
    .safeParse(payload)

  if (!parsed.success) {
    return 'Request failed'
  }

  return parsed.data.error ?? parsed.data.detail ?? parsed.data.message ?? 'Request failed'
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(value)
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue
    }
    query.set(key, String(value))
  }

  const encoded = query.toString()
  return encoded ? `?${encoded}` : ''
}

export function createChoreoClient(options: ChoreoClientOptions = {}) {
  const baseUrl = options.baseUrl ?? import.meta.env.VITE_CHOREO_BASE_URL ?? '/api'

  async function request<T>(path: string, init: RequestInit, schema: z.ZodType<T>): Promise<T> {
    const url = buildRequestUrl(baseUrl, path)
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      ...init,
    })

    const payload = await parseResponseJson(response)

    if (!response.ok) {
      throw new ChoreoApiError(parseErrorMessage(payload), response.status)
    }

    return schema.parse(payload)
  }

  return {
    getHealth: () => request('/health', { method: 'GET' }, healthResponseSchema),
    getFunctions: () => request('/functions', { method: 'GET' }, functionsResponseSchema),
    getRun: (runId: string) => request(`/runs/${encodePathSegment(runId)}`, { method: 'GET' }, runResponseSchema),
    getRuns: (params: RunsParams = {}) =>
      request(
        `/runs${toQueryString({
          limit: params.limit,
          offset: params.offset,
          status: params.status,
          function_id: params.function_id,
          event_id: params.event_id,
        })}`,
        { method: 'GET' },
        runsResponseSchema,
      ),
    getRunSteps: (runId: string) =>
      request(`/runs/${encodePathSegment(runId)}/steps`, { method: 'GET' }, runStepsResponseSchema),
    getEvent: (eventId: string) =>
      request(`/events/${encodePathSegment(eventId)}`, { method: 'GET' }, eventResponseSchema),
    getEvents: (params: EventsParams = {}) =>
      request(
        `/events${toQueryString({
          limit: params.limit,
          offset: params.offset,
          name: params.name,
        })}`,
        { method: 'GET' },
        eventsResponseSchema,
      ),
    sendEvent: (input: SendEventInput) =>
      request('/events', { method: 'POST', body: JSON.stringify(input) }, sendEventResponseSchema),
    cancelRun: (runId: string) =>
      request(`/runs/${encodePathSegment(runId)}/cancel`, { method: 'POST', body: JSON.stringify({}) }, runResponseSchema),
    config: {
      baseUrl,
    },
  }
}

export const choreoClient = createChoreoClient()

export type {
  EventResponse,
  FunctionDefinition,
  HealthResponse,
  RunResponse,
  SendEventResponse,
  StepResponse,
}
