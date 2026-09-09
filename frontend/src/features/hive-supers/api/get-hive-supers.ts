import { apiClient } from '@/shared/api/api-client';

import type { HiveSuper } from '../types/hive-super';

export function getHiveSupers(hiveId: string): Promise<HiveSuper[]> {
  return apiClient.get<HiveSuper[]>(`/api/hives/${hiveId}/supers`, {
    authenticated: true,
  });
}
