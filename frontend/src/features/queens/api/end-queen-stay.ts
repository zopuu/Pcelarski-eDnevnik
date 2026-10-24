import { apiClient } from '@/shared/api/api-client';

import type { EndQueenStayRequest, EndQueenStayResponse } from '../types/end-queen-stay';

export function endQueenStay(
  colonyId: string,
  request: EndQueenStayRequest,
): Promise<EndQueenStayResponse> {
  return apiClient.post<EndQueenStayResponse>(`/api/colonies/${colonyId}/end-queen-stay`, request, {
    authenticated: true,
  });
}
