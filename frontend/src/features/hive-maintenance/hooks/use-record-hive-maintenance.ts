import { useMutation, useQueryClient } from '@tanstack/react-query';

import { hiveActionQueryKeys } from '@/features/hive-actions/hive-action-query-keys';
import { hiveQueryKeys } from '@/features/hives/hive-query-keys';

import { recordHiveMaintenance } from '../api/record-hive-maintenance';
import type { RecordHiveMaintenanceRequest } from '../types/hive-maintenance';

export function useRecordHiveMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RecordHiveMaintenanceRequest) => recordHiveMaintenance(request),
    onSuccess: async (_response, request) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: hiveActionQueryKeys.history(request.hiveId),
        }),
        queryClient.invalidateQueries({
          queryKey: hiveQueryKeys.detail(request.hiveId),
        }),
      ]);
    },
  });
}
