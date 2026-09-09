import { useInfiniteQuery } from '@tanstack/react-query';

import { getHiveActionHistory } from '@/features/hive-actions/api/get-hive-action-history';
import { hiveActionQueryKeys } from '../hive-action-query-keys';

export function useHiveActionHistory(hiveId: string) {
  return useInfiniteQuery({
    queryKey: hiveActionQueryKeys.history(hiveId),
    queryFn: ({ pageParam }) => getHiveActionHistory(hiveId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: Boolean(hiveId),
  });
}
