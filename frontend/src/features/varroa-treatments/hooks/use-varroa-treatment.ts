import { useQuery } from '@tanstack/react-query';

import { getVarroaTreatment } from '../api/get-varroa-treatment';
import { varroaTreatmentQueryKeys } from '../varroa-treatment-query-keys';

export function useVarroaTreatment(hiveId: string, treatmentId: string) {
  return useQuery({
    queryKey: varroaTreatmentQueryKeys.detail(hiveId, treatmentId),
    queryFn: () => getVarroaTreatment(hiveId, treatmentId),
    enabled: Boolean(hiveId && treatmentId),
  });
}
