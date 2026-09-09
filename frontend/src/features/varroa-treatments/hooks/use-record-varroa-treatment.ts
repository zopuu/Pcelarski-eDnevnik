import { useMutation, useQueryClient } from '@tanstack/react-query';

import { hiveActionQueryKeys } from '@/features/hive-actions/hive-action-query-keys';

import { recordVarroaTreatment } from '../api/record-varroa-treatment';
import type { RecordVarroaTreatmentRequest } from '../types/varroa-treatment';

export function useRecordVarroaTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RecordVarroaTreatmentRequest) =>
      recordVarroaTreatment(request),

    onSuccess: async (_response, request) => {
      await Promise.all(
        request.hiveIds.map((hiveId) =>
          queryClient.invalidateQueries({
            queryKey: hiveActionQueryKeys.history(hiveId),
          }),
        ),
      );
    },
  });
}
