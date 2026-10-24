import { apiClient } from '@/shared/api/api-client';

import type { CurrentQueen } from '../types/queen';

export function getCurrentQueenByColony(colonyId: string): Promise<CurrentQueen | null> {
  return apiClient.get<CurrentQueen | null>(`/api/colonies/${colonyId}/current-queen`, {
    authenticated: true,
  });
}
