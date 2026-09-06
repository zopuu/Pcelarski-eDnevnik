import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  AvailableQueen,
} from '../types/change-queen';

export function getAvailableQueens(): Promise<AvailableQueen[]> {
  return apiClient.get<AvailableQueen[]>(
    '/api/queens/available',
    { authenticated: true },
  );
}
