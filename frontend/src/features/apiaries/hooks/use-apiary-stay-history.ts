import { useInfiniteQuery } from '@tanstack/react-query';

import { getApiaryStayHistory } from '../api/get-apiary-stay-history';
import { apiaryQueryKeys } from '../apiary-query-keys';

export function useApiaryStayHistory(apiaryId: string) {
  return useInfiniteQuery({
    queryKey: apiaryQueryKeys.stayHistory(apiaryId),
    queryFn: ({ pageParam }) => getApiaryStayHistory(apiaryId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    enabled: Boolean(apiaryId),
  });
}
