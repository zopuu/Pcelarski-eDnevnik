import { useMutation, useQueryClient } from '@tanstack/react-query';

import { hiveActionQueryKeys } from '@/features/hive-actions/hive-action-query-keys';

import { recordPattyFeeding } from '../api/record-patty-feeding';
import type { RecordPattyFeedingRequest } from '../types/patty-feeding';

export function useRecordPattyFeeding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RecordPattyFeedingRequest) => recordPattyFeeding(request),
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
