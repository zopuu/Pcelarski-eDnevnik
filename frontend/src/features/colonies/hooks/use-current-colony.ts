import { useQuery } from '@tanstack/react-query';

import { getCurrentColonyByHive } from '../api/get-current-colony-by-hive';

import { colonyQueryKeys } from '../colony-query-keys';

export function useCurrentColony(hiveId: string) {
  return useQuery({
    queryKey: colonyQueryKeys.currentByHive(hiveId),

    queryFn: () => getCurrentColonyByHive(hiveId),

    enabled: hiveId.length > 0,
  });
}
