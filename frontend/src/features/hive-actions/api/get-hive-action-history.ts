import { apiClient } from '@/shared/api/api-client';

import type { HiveActionHistoryPage } from '../types/hive-action-history';

export function getHiveActionHistory(
  hiveId: string,
  page: number,
): Promise<HiveActionHistoryPage> {
  return apiClient.get<HiveActionHistoryPage>(
    `/api/hives/${hiveId}/actions?page=${page}&pageSize=20`,
    {
      authenticated: true,
    },
  );
}
