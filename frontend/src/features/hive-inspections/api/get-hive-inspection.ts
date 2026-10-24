import { apiClient } from '@/shared/api/api-client';

import type { HiveInspectionDetails } from '../types/hive-inspection';

export function getHiveInspection(
  hiveId: string,
  inspectionId: string,
): Promise<HiveInspectionDetails> {
  return apiClient.get<HiveInspectionDetails>(`/api/hives/${hiveId}/inspections/${inspectionId}`, {
    authenticated: true,
  });
}
