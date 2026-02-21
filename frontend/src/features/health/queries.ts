import { useQuery } from '@tanstack/react-query'

import { choreoClient } from '../../api/client'

export function useHealthQuery() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => choreoClient.getHealth(),
    refetchInterval: 30_000,
  })
}

