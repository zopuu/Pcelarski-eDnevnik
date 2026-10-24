import { useMutation, useQueryClient } from '@tanstack/react-query';

import { hiveActionQueryKeys } from '@/features/hive-actions/hive-action-query-keys';

import { recordHoneyFrameFeeding } from '../api/record-honey-frame-feeding';
import type { RecordHoneyFrameFeedingRequest } from '../types/honey-frame-feeding';

export function useRecordHoneyFrameFeeding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RecordHoneyFrameFeedingRequest) => recordHoneyFrameFeeding(request),
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
