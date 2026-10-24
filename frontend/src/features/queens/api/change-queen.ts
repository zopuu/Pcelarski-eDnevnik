import { apiClient } from '@/shared/api/api-client';

import type { ChangeQueenRequest, ChangeQueenResponse } from '../types/change-queen';

export function changeQueen(
  colonyId: string,
  request: ChangeQueenRequest,
): Promise<ChangeQueenResponse> {
  return apiClient.post<ChangeQueenResponse>(`/api/colonies/${colonyId}/change-queen`, request, {
    authenticated: true,
  });
}
