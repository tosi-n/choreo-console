import { useQuery } from '@tanstack/react-query'

import { choreoClient } from '../../api/client'

type EventsFilters = {
  limit?: number
  offset?: number
  name?: string
  enabled?: boolean
}

export function useEventsQuery(filters: EventsFilters = {}) {
  return useQuery({
    queryKey: ['events', filters.limit, filters.offset, filters.name],
    queryFn: () =>
      choreoClient.getEvents({
        limit: filters.limit,
        offset: filters.offset,
        name: filters.name,
      }),
    enabled: filters.enabled ?? true,
    refetchInterval: 30_000,
  })
}

export function useEventQuery(eventId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => choreoClient.getEvent(eventId ?? ''),
    enabled: enabled && Boolean(eventId),
  })
}
