import {
  useInfiniteQuery,
} from '@tanstack/react-query';

import {
  getForageObservations,
} from '../api/get-forage-observations';
import {
  forageObservationQueryKeys,
} from '../forage-observation-query-keys';

export function useForageObservations() {
  return useInfiniteQuery({
    queryKey:
      forageObservationQueryKeys.all,
    queryFn: ({ pageParam }) =>
      getForageObservations(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? lastPage.page + 1
        : undefined,
  });
}
