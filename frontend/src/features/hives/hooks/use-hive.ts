import {
  useQuery,
} from '@tanstack/react-query';

import {
  getHiveById,
} from '../api/get-hive-by-id';

import {
  hiveQueryKeys,
} from '../hive-query-keys';

export function useHive(
  hiveId: string,
) {
  return useQuery({
    queryKey:
      hiveQueryKeys.detail(
        hiveId,
      ),

    queryFn: () =>
      getHiveById(
        hiveId,
      ),

    enabled:
      hiveId.length > 0,
  });
}