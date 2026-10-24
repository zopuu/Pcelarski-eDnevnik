import { apiClient } from '@/shared/api/api-client';

import type { TransferColonyRequest, TransferColonyResponse } from '../types/transfer-colony';

export function transferColony(
  colonyId: string,
  request: TransferColonyRequest,
): Promise<TransferColonyResponse> {
  return apiClient.post<TransferColonyResponse, TransferColonyRequest>(
    `/api/colonies/${colonyId}/transfer`,
    request,
    {
      authenticated: true,
    },
  );
}
