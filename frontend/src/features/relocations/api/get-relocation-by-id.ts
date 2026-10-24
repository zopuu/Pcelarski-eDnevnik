import { apiClient } from '@/shared/api/api-client';

import type { RelocationDetails } from '../types/relocation-details';

export function getRelocationById(relocationId: string): Promise<RelocationDetails> {
  return apiClient.get<RelocationDetails>(`/api/relocations/${relocationId}`, {
    authenticated: true,
  });
}
