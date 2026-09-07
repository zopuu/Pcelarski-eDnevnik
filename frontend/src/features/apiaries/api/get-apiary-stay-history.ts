import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  ApiaryStayHistoryPage,
} from '../types/apiary-stay';

export function getApiaryStayHistory(
  apiaryId: string,
  page: number,
): Promise<ApiaryStayHistoryPage> {
  return apiClient.get<ApiaryStayHistoryPage>(
    `/api/apiaries/${apiaryId}/stays/history?page=${page}&pageSize=20`,
    {
      authenticated: true,
    },
  );
}
