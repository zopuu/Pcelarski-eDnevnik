import { apiClient } from '@/shared/api/api-client';

import type { QueenStayHistoryPage } from '../types/queen-stay-history';

export function getQueenStays(queenId: string, page: number): Promise<QueenStayHistoryPage> {
  return apiClient.get<QueenStayHistoryPage>(
    `/api/queens/${queenId}/stays?page=${page}&pageSize=20`,
    {
      authenticated: true,
    },
  );
}
