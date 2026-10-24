import { apiClient } from '@/shared/api/api-client';

import type {
  RecordHiveInsulationRequest,
  RecordHiveInsulationResponse,
} from '../types/hive-insulation';

export function recordHiveInsulation(
  request: RecordHiveInsulationRequest,
): Promise<RecordHiveInsulationResponse> {
  return apiClient.post<RecordHiveInsulationResponse>('/api/hive-actions/insulation', request, {
    authenticated: true,
  });
}
