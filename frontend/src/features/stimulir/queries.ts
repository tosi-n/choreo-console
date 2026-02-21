import { useQuery } from '@tanstack/react-query'

import { choreoClient } from '../../api/client'

type StimulirTraceFilters = {
  token: string
  status: string
  modelProvider: string
  limit?: number
  offset?: number
}

export function useStimulirTracesQuery(filters: StimulirTraceFilters) {
  return useQuery({
    queryKey: ['stimulir', 'traces', filters.status, filters.modelProvider, filters.limit, filters.offset, filters.token],
    queryFn: () =>
      choreoClient.getStimulirTraces(
        {
          status: filters.status === 'all' ? undefined : filters.status,
          model_provider: filters.modelProvider === 'all' ? undefined : filters.modelProvider,
          limit: filters.limit,
          offset: filters.offset,
        },
        filters.token,
      ),
    enabled: Boolean(filters.token),
    refetchInterval: 30_000,
  })
}

export function useStimulirWorkerStatusQuery(token: string) {
  return useQuery({
    queryKey: ['stimulir', 'worker-status', token],
    queryFn: () => choreoClient.getStimulirWorkerStatus(token),
    enabled: Boolean(token),
    refetchInterval: 30_000,
  })
}

export function useStimulirTraceDetailQuery(traceId: string | undefined, token: string, enabled = true) {
  return useQuery({
    queryKey: ['stimulir', 'trace-detail', traceId, token],
    queryFn: () => choreoClient.getStimulirTraceDetail(traceId ?? '', token),
    enabled: enabled && Boolean(traceId) && Boolean(token),
  })
}
