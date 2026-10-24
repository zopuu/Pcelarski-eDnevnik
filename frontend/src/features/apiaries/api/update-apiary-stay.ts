import { apiClient } from '@/shared/api/api-client';

import type { CurrentApiaryStay } from '../types/apiary-stay';

import type { UpdateApiaryStayRequest } from '../types/update-apiary';

export function updateApiaryStay(
  apiaryId: string,
  stayId: string,
  request: UpdateApiaryStayRequest,
): Promise<CurrentApiaryStay> {
  return apiClient.put<CurrentApiaryStay>(`/api/apiaries/${apiaryId}/stays/${stayId}`, request, {
    authenticated: true,
  });
}
