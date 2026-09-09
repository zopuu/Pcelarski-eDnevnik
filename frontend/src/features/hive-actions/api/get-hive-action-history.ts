import { apiClient } from '@/shared/api/api-client';

import type { HiveActionHistoryPage } from '../types/hive-action-history';

export function getHiveActionHistory(
  hiveId: string,
  cursor: string | null,
): Promise<HiveActionHistoryPage> {
  const searchParams = new URLSearchParams({ limit: '20' });

  if (cursor) {
    searchParams.set('cursor', cursor);
  }

  return apiClient.get<HiveActionHistoryPage>(
    `/api/hives/${hiveId}/actions?${searchParams.toString()}`,
    {
      authenticated: true,
    },
  );
}
