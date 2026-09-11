import { apiClient } from '@/shared/api/api-client';
import type {
  HoneyBatchComposition,
  SetManualHoneyBatchCompositionRequest,
} from '../types/harvest';

export function setManualHoneyBatchComposition(
  batchId: string,
  request: SetManualHoneyBatchCompositionRequest,
) {
  return apiClient.put<HoneyBatchComposition>(
    `/api/honey-batches/${batchId}/composition/manual`,
    request,
    { authenticated: true },
  );
}
