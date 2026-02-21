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

export const stimulirTraceSchema = z.object({
  id: z.string(),
  task_id: z.string().nullable().optional(),
  durable_session_id: z.string().nullable().optional(),
  business_profile_id: z.string().nullable().optional(),
  model_name: z.string().nullable().optional(),
  model_provider: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  context_type: z.string().nullable().optional(),
  prompt_key: z.string().nullable().optional(),
  prompt_version: z.number().nullable().optional(),
  status: z.string(),
  error_message: z.string().nullable().optional(),
  started_at: z.string(),
  completed_at: z.string().nullable().optional(),
  duration_ms: z.number().nullable().optional(),
  input_tokens: z.number().nullable().optional(),
  output_tokens: z.number().nullable().optional(),
  total_tokens: z.number().nullable().optional(),
  created_at: z.string(),
})

export const stimulirTracesResponseSchema = z.array(stimulirTraceSchema)

export const stimulirWorkerStatusSchema = z.object({
  tasks_queued: z.number(),
  tasks_executing: z.number(),
  tasks_researched: z.number(),
  tasks_failed: z.number(),
  tasks_runnable: z.number(),
  orchestrator: z.string(),
  worker_running: z.boolean(),
  worker_last_tick: z.string().nullable().optional(),
  worker_last_error: z.string().nullable().optional(),
})

export const stimulirTraceDetailSchema = z.object({
  trace: stimulirTraceSchema.optional(),
  messages: z.array(z.unknown()).optional(),
  tool_calls: z.array(z.unknown()).optional(),
  debug_logs: z.array(z.unknown()).optional(),
})

export type HealthResponse = z.infer<typeof healthResponseSchema>
export type RunResponse = z.infer<typeof runResponseSchema>
export type StepResponse = z.infer<typeof stepResponseSchema>
export type FunctionDefinition = z.infer<typeof functionDefinitionSchema>
export type FunctionTrigger = z.infer<typeof functionTriggerSchema>
export type SendEventResponse = z.infer<typeof sendEventResponseSchema>
export type StimulirTrace = z.infer<typeof stimulirTraceSchema>
export type StimulirTraceDetail = z.infer<typeof stimulirTraceDetailSchema>
export type StimulirWorkerStatus = z.infer<typeof stimulirWorkerStatusSchema>
