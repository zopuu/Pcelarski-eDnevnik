import { apiClient } from '@/shared/api/api-client';
import type {
  HoneyBatchComposition,
  SetLaboratoryHoneyBatchCompositionRequest,
} from '../types/harvest';

export function setLaboratoryHoneyBatchComposition(
  batchId: string,
  request: SetLaboratoryHoneyBatchCompositionRequest,
) {
  return apiClient.put<HoneyBatchComposition>(
    `/api/honey-batches/${batchId}/composition/laboratory`,
    request,
    { authenticated: true },
  );
}
