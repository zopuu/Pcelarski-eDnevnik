import { apiClient } from '@/shared/api/api-client';

import type { TransferDestinationHive } from '../types/transfer-colony';

export function getTransferDestinations(colonyId: string): Promise<TransferDestinationHive[]> {
  return apiClient.get<TransferDestinationHive[]>(
    `/api/colonies/${colonyId}/transfer-destinations`,
    {
      authenticated: true,
    },
  );
}
