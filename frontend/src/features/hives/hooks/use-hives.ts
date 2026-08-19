import {
  useQuery,
} from '@tanstack/react-query';

import {
  getHives,
} from '../api/get-hives';

import {
  hiveQueryKeys,
} from '../api/hive-query-keys';

export function useHives(
  apiaryId: string,
) {
  return useQuery({
    queryKey:
      hiveQueryKeys.byApiary(
        apiaryId,
      ),

    queryFn: () =>
      getHives(
        apiaryId,
      ),

    enabled:
      apiaryId.length > 0,
  });
}