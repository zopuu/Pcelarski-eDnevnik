import { apiClient } from '@/shared/api/api-client';

import type { CreateQueenRequest, CreateQueenResponse } from '../types/create-queen';

export function createQueen(
  colonyId: string,
  request: CreateQueenRequest,
): Promise<CreateQueenResponse> {
  return apiClient.post<CreateQueenResponse>(`/api/colonies/${colonyId}/queens`, request, {
    authenticated: true,
  });
}
