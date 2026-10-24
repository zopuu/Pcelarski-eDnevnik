import { apiClient } from '@/shared/api/api-client';

import type { HiveDetails } from '../types/hive-details';

export function getHiveById(hiveId: string): Promise<HiveDetails> {
  return apiClient.get<HiveDetails>(`/api/hives/${hiveId}`, {
    authenticated: true,
  });
}
