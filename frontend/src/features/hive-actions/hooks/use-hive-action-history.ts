import { useInfiniteQuery } from '@tanstack/react-query';

import { getHiveActionHistory } from '@/features/hive-actions/api/get-hive-action-history';
import { hiveActionQueryKeys } from '../hive-action-query-keys';

export function useHiveActionHistory(hiveId: string) {
  return useInfiniteQuery({
    queryKey: hiveActionQueryKeys.history(hiveId),
    queryFn: ({ pageParam }) => getHiveActionHistory(hiveId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(hiveId),
  });
}
