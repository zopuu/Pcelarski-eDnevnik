import { apiClient } from '@/shared/api/api-client';

import type { CurrentApiaryStay } from '../types/apiary-stay';

export function getCurrentApiaryStay(apiaryId: string): Promise<CurrentApiaryStay> {
  return apiClient.get<CurrentApiaryStay>(`/api/apiaries/${apiaryId}/stays/current`, {
    authenticated: true,
  });
}
