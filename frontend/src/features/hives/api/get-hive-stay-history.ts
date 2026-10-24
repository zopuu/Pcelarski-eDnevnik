import { apiClient } from '@/shared/api/api-client';

import type { HiveStayHistoryPage } from '../types/hive-stay';

export function getHiveStayHistory(hiveId: string, page: number): Promise<HiveStayHistoryPage> {
  return apiClient.get<HiveStayHistoryPage>(
    `/api/hives/${hiveId}/stays/history?page=${page}&pageSize=20`,
    {
      authenticated: true,
    },
  );
}
