import { useInfiniteQuery } from '@tanstack/react-query';

import { getQueenStays } from '../api/get-queen-stays';
import { queenQueryKeys } from '../queen-query-keys';

export function useQueenStays(queenId: string) {
  return useInfiniteQuery({
    queryKey: queenQueryKeys.stayHistory(queenId),
    queryFn: ({ pageParam }) => getQueenStays(queenId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
  });
}
