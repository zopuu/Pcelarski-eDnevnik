import { useInfiniteQuery } from '@tanstack/react-query';
import { getHoneyBatches } from '../api/get-honey-batches';
import { honeyBatchQueryKeys } from '../query-keys';

const pageSize = 20;

export function useHoneyBatches() {
  return useInfiniteQuery({
    queryKey: honeyBatchQueryKeys.list(pageSize),
    queryFn: ({ pageParam }) => getHoneyBatches(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page.page < lastPage.page.totalPages
        ? lastPage.page.page + 1
        : undefined,
  });
}
