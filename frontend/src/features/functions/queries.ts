import { useQuery } from '@tanstack/react-query'

import { choreoClient } from '../../api/client'

export function useFunctionsQuery() {
  return useQuery({
    queryKey: ['functions'],
    queryFn: () => choreoClient.getFunctions(),
    refetchInterval: 30_000,
  })
}
