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

export const runsResponseSchema = z.array(runResponseSchema)

export const eventResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  data: z.unknown(),
  timestamp: z.string(),
  idempotency_key: z.string().nullable().optional(),
  user_id: z.string().nullable().optional(),
})

export const eventsResponseSchema = z.array(eventResponseSchema)

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

export const functionTriggerSchema = z.object({
  type: z.string(),
  name: z.string().nullable().optional(),
  schedule: z.string().nullable().optional(),
})

export const functionDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  triggers: z.array(functionTriggerSchema),
  retries: z
    .object({
      max_attempts: z.number(),
    })
    .nullable()
    .optional(),
  timeout_secs: z.number().nullable().optional(),
  priority: z.number().nullable().optional(),
})

export const functionsResponseSchema = z.array(functionDefinitionSchema)

export const sendEventResponseSchema = z.object({
  event_id: z.string().uuid(),
  run_ids: z.array(z.string().uuid()),
})

export type HealthResponse = z.infer<typeof healthResponseSchema>
export type RunResponse = z.infer<typeof runResponseSchema>
export type EventResponse = z.infer<typeof eventResponseSchema>
export type StepResponse = z.infer<typeof stepResponseSchema>
export type FunctionDefinition = z.infer<typeof functionDefinitionSchema>
export type FunctionTrigger = z.infer<typeof functionTriggerSchema>
export type SendEventResponse = z.infer<typeof sendEventResponseSchema>
