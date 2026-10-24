import { useMutation, useQueryClient } from '@tanstack/react-query';

import { recordHiveInspection } from '../api/record-hive-inspection';
import { hiveInspectionQueryKeys } from '../hive-inspection-query-keys';
import type { RecordHiveInspectionRequest } from '../types/hive-inspection';

export function useRecordHiveInspection(hiveId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RecordHiveInspectionRequest) => recordHiveInspection(hiveId, request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: hiveInspectionQueryKeys.byHive(hiveId),
      });
    },
  });
}
