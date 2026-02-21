import { z } from 'zod'

import {
  functionsResponseSchema,
  healthResponseSchema,
  runResponseSchema,
  runStepsResponseSchema,
  sendEventResponseSchema,
  stimulirTraceDetailSchema,
  stimulirTracesResponseSchema,
  stimulirWorkerStatusSchema,
  type FunctionDefinition,
  type HealthResponse,
  type RunResponse,
  type SendEventResponse,
  type StimulirTrace,
  type StimulirTraceDetail,
  type StimulirWorkerStatus,
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
  stimulirBaseUrl?: string
  stimulirAuthToken?: string
}

export type SendEventInput = {
  name: string
  data: Record<string, unknown>
  idempotency_key?: string
  user_id?: string
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

function withOptionalAuthHeader(headers: HeadersInit | undefined, token?: string): HeadersInit {
  if (!token) {
    return headers ?? {}
  }

  const prefixed = token.startsWith('Bearer ') ? token : `Bearer ${token}`
  return {
    ...(headers ?? {}),
    Authorization: prefixed,
  }
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(value)
}

export type StimulirTracesParams = {
  limit?: number
  offset?: number
  status?: string
  model_provider?: string
}

export function createChoreoClient(options: ChoreoClientOptions = {}) {
  const baseUrl = options.baseUrl ?? import.meta.env.VITE_CHOREO_BASE_URL ?? '/api'
  const stimulirBaseUrl =
    options.stimulirBaseUrl ?? import.meta.env.VITE_STIMULIR_BASE_URL ?? '/stimulir-api'
  const stimulirAuthToken = options.stimulirAuthToken ?? import.meta.env.VITE_STIMULIR_AUTH_TOKEN ?? ''

  async function request<T>(
    base: string,
    path: string,
    init: RequestInit,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const url = buildRequestUrl(base, path)
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
    getHealth: () => request(baseUrl, '/health', { method: 'GET' }, healthResponseSchema),
    getFunctions: () => request(baseUrl, '/functions', { method: 'GET' }, functionsResponseSchema),
    getRun: (runId: string) => request(baseUrl, `/runs/${runId}`, { method: 'GET' }, runResponseSchema),
    getRunSteps: (runId: string) =>
      request(baseUrl, `/runs/${runId}/steps`, { method: 'GET' }, runStepsResponseSchema),
    sendEvent: (input: SendEventInput) =>
      request(baseUrl, '/events', { method: 'POST', body: JSON.stringify(input) }, sendEventResponseSchema),
    cancelRun: (runId: string) =>
      request(baseUrl, `/runs/${runId}/cancel`, { method: 'POST', body: JSON.stringify({}) }, runResponseSchema),
    getStimulirTraces: (params: StimulirTracesParams = {}, tokenOverride?: string) => {
      const query = new URLSearchParams()
      if (typeof params.limit === 'number') {
        query.set('limit', String(params.limit))
      }
      if (typeof params.offset === 'number') {
        query.set('offset', String(params.offset))
      }
      if (params.status) {
        query.set('status', params.status)
      }
      if (params.model_provider) {
        query.set('model_provider', params.model_provider)
      }

      const suffix = query.toString()
      const path = suffix ? `/admin/traces?${suffix}` : '/admin/traces'

      return request(
        stimulirBaseUrl,
        path,
        {
          method: 'GET',
          headers: withOptionalAuthHeader(undefined, tokenOverride ?? stimulirAuthToken),
        },
        stimulirTracesResponseSchema,
      )
    },
    getStimulirTraceDetail: (traceId: string, tokenOverride?: string) =>
      request(
        stimulirBaseUrl,
        `/admin/traces/${encodePathSegment(traceId)}`,
        {
          method: 'GET',
          headers: withOptionalAuthHeader(undefined, tokenOverride ?? stimulirAuthToken),
        },
        stimulirTraceDetailSchema,
      ),
    getStimulirWorkerStatus: (tokenOverride?: string) =>
      request(
        stimulirBaseUrl,
        '/worker/status',
        {
          method: 'GET',
          headers: withOptionalAuthHeader(undefined, tokenOverride ?? stimulirAuthToken),
        },
        stimulirWorkerStatusSchema,
      ),
    config: {
      baseUrl,
      stimulirBaseUrl,
      stimulirConfigured: Boolean(stimulirAuthToken),
    },
  }
}

export const choreoClient = createChoreoClient()

export type {
  FunctionDefinition,
  HealthResponse,
  RunResponse,
  SendEventResponse,
  StimulirTrace,
  StimulirTraceDetail,
  StimulirWorkerStatus,
  StepResponse,
}
