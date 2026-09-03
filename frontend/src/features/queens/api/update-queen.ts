import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  UpdateQueenRequest,
  UpdateQueenResponse,
} from '../types/update-queen';

export function updateQueen(
  queenId: string,
  request: UpdateQueenRequest,
): Promise<UpdateQueenResponse> {
  return apiClient.put<UpdateQueenResponse>(
    `/api/queens/${queenId}`,
    request,
    {
      authenticated: true,
    },
  );
}
