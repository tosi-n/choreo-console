import { z } from 'zod'

import {
  healthResponseSchema,
  runResponseSchema,
  runStepsResponseSchema,
  type HealthResponse,
  type RunResponse,
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

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`
}

async function parseResponseJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown
  } catch {
    return null
  }
}

function parseErrorMessage(payload: unknown): string {
  const parsed = z.object({ error: z.string() }).safeParse(payload)
  return parsed.success ? parsed.data.error : 'Request failed'
}

export function createChoreoClient(options: ChoreoClientOptions = {}) {
  const baseUrl = options.baseUrl ?? import.meta.env.VITE_CHOREO_BASE_URL ?? 'http://localhost:8080'
  const base = ensureTrailingSlash(baseUrl)

  async function request<T>(
    path: string,
    init: RequestInit,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const url = new URL(path.replace(/^\//, ''), base)
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
    getRun: (runId: string) => request(`/runs/${runId}`, { method: 'GET' }, runResponseSchema),
    getRunSteps: (runId: string) =>
      request(`/runs/${runId}/steps`, { method: 'GET' }, runStepsResponseSchema),
    cancelRun: (runId: string) =>
      request(`/runs/${runId}/cancel`, { method: 'POST', body: JSON.stringify({}) }, runResponseSchema),
    config: {
      baseUrl,
    },
  }
}

export const choreoClient = createChoreoClient()

export type { HealthResponse, RunResponse, StepResponse }

