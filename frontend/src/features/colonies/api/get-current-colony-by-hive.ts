import { apiClient } from '@/shared/api/api-client';

import type { CurrentColony } from '../types/colony';

export function getCurrentColonyByHive(hiveId: string): Promise<CurrentColony | null> {
  return apiClient.get<CurrentColony | null>(`/api/hives/${hiveId}/current-colony`, {
    authenticated: true,
  });
}
