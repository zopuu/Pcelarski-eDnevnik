import { apiClient } from '@/shared/api/api-client';

import type { HiveInsulationDetails } from '../types/hive-insulation';

export function getHiveInsulation(
  hiveId: string,
  actionId: string,
): Promise<HiveInsulationDetails> {
  return apiClient.get<HiveInsulationDetails>(
    `/api/hives/${hiveId}/insulation/${actionId}`,
    { authenticated: true },
  );
}
