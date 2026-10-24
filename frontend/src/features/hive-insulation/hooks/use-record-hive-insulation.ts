import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiaryQueryKeys } from '@/features/apiaries/apiary-query-keys';
import { hiveActionQueryKeys } from '@/features/hive-actions/hive-action-query-keys';
import { hiveQueryKeys } from '@/features/hives/hive-query-keys';

import { recordHiveInsulation } from '../api/record-hive-insulation';
import { hiveInsulationQueryKeys } from '../hive-insulation-query-keys';
import type { RecordHiveInsulationRequest } from '../types/hive-insulation';

export function useRecordHiveInsulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RecordHiveInsulationRequest) => recordHiveInsulation(request),
    onSuccess: async (_response, request) => {
      await Promise.all([
        ...request.hives.flatMap((hive) => [
          queryClient.invalidateQueries({
            queryKey: hiveInsulationQueryKeys.current(hive.hiveId),
          }),
          queryClient.invalidateQueries({
            queryKey: hiveActionQueryKeys.history(hive.hiveId),
          }),
          queryClient.invalidateQueries({
            queryKey: hiveQueryKeys.detail(hive.hiveId),
          }),
        ]),
        queryClient.invalidateQueries({ queryKey: hiveQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: apiaryQueryKeys.all }),
      ]);
    },
  });
}
