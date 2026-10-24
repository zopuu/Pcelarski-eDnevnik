import { useMutation, useQueryClient } from '@tanstack/react-query';

import { hiveActionQueryKeys } from '@/features/hive-actions/hive-action-query-keys';

import { recordSyrupFeeding } from '../api/record-syrup-feeding';
import type { RecordSyrupFeedingRequest } from '../types/syrup-feeding';

export function useRecordSyrupFeeding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RecordSyrupFeedingRequest) => recordSyrupFeeding(request),

    onSuccess: async (_response, request) => {
      await Promise.all(
        request.hives.map((hive) =>
          queryClient.invalidateQueries({
            queryKey: hiveActionQueryKeys.history(hive.hiveId),
          }),
        ),
      );
    },
  });
}
