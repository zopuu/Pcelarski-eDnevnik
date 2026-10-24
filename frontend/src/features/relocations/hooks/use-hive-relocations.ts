import { useInfiniteQuery } from '@tanstack/react-query';

import { getHiveRelocations } from '../api/get-hive-relocations';
import { relocationQueryKeys } from '../relocation-query-keys';

export function useHiveRelocations(hiveId: string) {
  return useInfiniteQuery({
    queryKey: relocationQueryKeys.hiveHistory(hiveId),
    queryFn: ({ pageParam }) => getHiveRelocations(hiveId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
  });
}
