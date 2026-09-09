import { apiClient } from '@/shared/api/api-client';

import type {
  RecordVarroaTreatmentRequest,
  RecordVarroaTreatmentResponse,
} from '../types/varroa-treatment';

export function recordVarroaTreatment(
  request: RecordVarroaTreatmentRequest,
): Promise<RecordVarroaTreatmentResponse> {
  return apiClient.post<RecordVarroaTreatmentResponse>(
    '/api/hive-actions/varroa-treatments',
    request,
    {
      authenticated: true,
    },
  );
}
