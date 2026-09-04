import {
  useInfiniteQuery,
} from '@tanstack/react-query';

import {
  getForageObservations,
  getForageObservationsByProfile,
} from '../api/get-forage-observations';
import {
  forageObservationQueryKeys,
} from '../forage-observation-query-keys';

export function useForageObservations(
  forageProfileId?: string,
) {
  return useInfiniteQuery({
    queryKey: forageProfileId
      ? forageObservationQueryKeys.byProfile(
        forageProfileId,
      )
      : forageObservationQueryKeys.all,
    queryFn: ({ pageParam }) =>
      forageProfileId
        ? getForageObservationsByProfile(
          forageProfileId,
          pageParam,
        )
        : getForageObservations(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? lastPage.page + 1
        : undefined,
  });
}
