import { apiClient } from '@/shared/api/api-client';

import type { HiveInspectionHistoryPage } from '../types/hive-inspection';

export function getHiveInspectionHistory(
  hiveId: string,
  page: number,
): Promise<HiveInspectionHistoryPage> {
  return apiClient.get<HiveInspectionHistoryPage>(
    `/api/hives/${hiveId}/inspections?page=${page}&pageSize=20`,
    { authenticated: true },
  );
}
