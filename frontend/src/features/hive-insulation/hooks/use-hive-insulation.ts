import { useQuery } from '@tanstack/react-query';

import { getHiveInsulation } from '../api/get-hive-insulation';
import { hiveInsulationQueryKeys } from '../hive-insulation-query-keys';

export function useHiveInsulation(hiveId: string, actionId: string) {
  return useQuery({
    queryKey: hiveInsulationQueryKeys.detail(hiveId, actionId),
    queryFn: () => getHiveInsulation(hiveId, actionId),
    enabled: Boolean(hiveId && actionId),
  });
}
