import { useInfiniteQuery } from '@tanstack/react-query';
import { getHarvests } from '../api/get-harvests';
import { harvestQueryKeys } from '../query-keys';

const pageSize = 20;

export function useHarvests() {
  return useInfiniteQuery({
    queryKey: harvestQueryKeys.list(pageSize),
    queryFn: ({ pageParam }) => getHarvests(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page.page < lastPage.page.totalPages
        ? lastPage.page.page + 1
        : undefined,
  });
}
