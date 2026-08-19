import {
  apiClient,
} from '@/shared/api/api-client';

import type {
  HiveListItem,
} from '../types/hive-list-item';

export function getHives(
  apiaryId: string,
): Promise<HiveListItem[]> {
  return apiClient.get<
    HiveListItem[]
  >(
    `/api/apiaries/${apiaryId}/hives`,
    {
      authenticated: true,
    },
  );
}