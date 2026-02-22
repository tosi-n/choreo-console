import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { choreoClient } from '../../api/client'

type RunsFilters = {
  limit?: number
  offset?: number
  status?: string
  functionId?: string
  eventId?: string
  enabled?: boolean
}

export function useRunsQuery(filters: RunsFilters = {}) {
  return useQuery({
    queryKey: ['runs', filters.limit, filters.offset, filters.status, filters.functionId, filters.eventId],
    queryFn: () =>
      choreoClient.getRuns({
        limit: filters.limit,
        offset: filters.offset,
        status: filters.status,
        function_id: filters.functionId,
        event_id: filters.eventId,
      }),
    enabled: filters.enabled ?? true,
    refetchInterval: 30_000,
  })
}

export function useRunQuery(runId: string | undefined) {
  return useQuery({
    queryKey: ['run', runId],
    queryFn: () => choreoClient.getRun(runId ?? ''),
    enabled: Boolean(runId),
  })
}

export function useRunStepsQuery(runId: string | undefined) {
  return useQuery({
    queryKey: ['run', runId, 'steps'],
    queryFn: () => choreoClient.getRunSteps(runId ?? ''),
    enabled: Boolean(runId),
  })
}

export function useCancelRunMutation(runId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!runId) {
        throw new Error('Missing run id')
      }
      return choreoClient.cancelRun(runId)
    },
    onSuccess: (updatedRun) => {
      queryClient.setQueryData(['run', runId], updatedRun)
      queryClient.invalidateQueries({ queryKey: ['run', runId, 'steps'] })
      queryClient.invalidateQueries({ queryKey: ['runs'] })
    },
  })
}
