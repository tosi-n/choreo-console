import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { choreoClient } from '../../api/client'

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
    },
  })
}

