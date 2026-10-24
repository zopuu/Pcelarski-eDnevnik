import { useQuery } from '@tanstack/react-query';

import { getRelocationById } from '../api/get-relocation-by-id';
import { relocationQueryKeys } from '../relocation-query-keys';

export function useRelocation(relocationId: string) {
  return useQuery({
    queryKey: [...relocationQueryKeys.all, 'detail', relocationId],
    queryFn: () => getRelocationById(relocationId),
  });
}
