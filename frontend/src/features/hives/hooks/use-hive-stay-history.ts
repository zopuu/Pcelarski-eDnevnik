import {
  useInfiniteQuery,
} from '@tanstack/react-query';

import {
  getHiveStayHistory,
} from '../api/get-hive-stay-history';
import {
  hiveQueryKeys,
} from '../hive-query-keys';

export function useHiveStayHistory(
  hiveId: string,
) {
  return useInfiniteQuery({
    queryKey: hiveQueryKeys.stayHistory(hiveId),
    queryFn: ({ pageParam }) =>
      getHiveStayHistory(hiveId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage
        ? lastPage.page + 1
        : undefined,
    enabled: Boolean(hiveId),
  });
}
