import { apiClient } from '@/shared/api/api-client';

import type { HiveInsulationState } from '../types/hive-insulation';

export function getCurrentHiveInsulation(
  hiveId: string,
): Promise<HiveInsulationState> {
  return apiClient.get<HiveInsulationState>(
    `/api/hives/${hiveId}/insulation/current`,
    { authenticated: true },
  );
}
