import { apiClient } from '@/shared/api/api-client';

import type { VarroaTreatmentDetails } from '../types/varroa-treatment';

export function getVarroaTreatment(
  hiveId: string,
  treatmentId: string,
): Promise<VarroaTreatmentDetails> {
  return apiClient.get<VarroaTreatmentDetails>(
    `/api/hives/${hiveId}/varroa-treatments/${treatmentId}`,
    {
      authenticated: true,
    },
  );
}
