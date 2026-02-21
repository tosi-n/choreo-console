import { z } from 'zod'

export const healthResponseSchema = z.object({
  status: z.string(),
  database: z.string(),
})

export const runResponseSchema = z.object({
  id: z.string().uuid(),
  function_id: z.string(),
  event_id: z.string().uuid(),
  status: z.string(),
  attempt: z.number(),
  max_attempts: z.number(),
  input: z.unknown(),
  output: z.unknown().nullable().optional(),
  error: z.string().nullable().optional(),
  created_at: z.string(),
  started_at: z.string().nullable().optional(),
  ended_at: z.string().nullable().optional(),
})

export const stepResponseSchema = z.object({
  id: z.string().uuid(),
  step_id: z.string(),
  status: z.string(),
  output: z.unknown().nullable().optional(),
  error: z.string().nullable().optional(),
  attempt: z.number(),
  created_at: z.string(),
  ended_at: z.string().nullable().optional(),
})

export const runStepsResponseSchema = z.array(stepResponseSchema)

export type HealthResponse = z.infer<typeof healthResponseSchema>
export type RunResponse = z.infer<typeof runResponseSchema>
export type StepResponse = z.infer<typeof stepResponseSchema>

