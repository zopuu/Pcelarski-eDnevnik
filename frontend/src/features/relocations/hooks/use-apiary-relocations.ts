import { useInfiniteQuery } from '@tanstack/react-query';

import { getApiaryRelocations } from '../api/get-apiary-relocations';
import { relocationQueryKeys } from '../relocation-query-keys';

export function useApiaryRelocations(apiaryId: string) {
  return useInfiniteQuery({
    queryKey: relocationQueryKeys.history(apiaryId),
    queryFn: ({ pageParam }) => getApiaryRelocations(apiaryId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
  });
}
