import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  CreateColonyWithQueenRequest,
  CreateColonyWithQueenResponse,
} from '../types/create-colony-with-queen';

export function createColonyWithQueen(
  hiveId: string,
  request:
    CreateColonyWithQueenRequest,
): Promise<
  CreateColonyWithQueenResponse
> {
  return apiClient.post<
    CreateColonyWithQueenResponse
  >(
    `/api/hives/${hiveId}/colony-with-queen`,
    request,
    {
      authenticated: true,
    },
  );
}