import { useQuery } from '@tanstack/react-query';

import { getHiveSupers } from '../api/get-hive-supers';
import { hiveSuperQueryKeys } from '../hive-super-query-keys';

export function useHiveSupers(hiveId: string) {
  return useQuery({
    queryKey: hiveSuperQueryKeys.current(hiveId),
    queryFn: () => getHiveSupers(hiveId),
    enabled: hiveId.length > 0,
  });
}
