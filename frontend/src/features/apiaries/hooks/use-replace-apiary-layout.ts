import { useMutation, useQueryClient } from '@tanstack/react-query';

import { replaceApiaryLayout } from '../api/replace-apiary-layout';
import { apiaryQueryKeys } from '../apiary-query-keys';
import type { ReplaceApiaryLayoutRequest } from '../types/apiary-layout';

type ReplaceApiaryLayoutVariables = {
  apiaryId: string;
  request: ReplaceApiaryLayoutRequest;
};

export function useReplaceApiaryLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ apiaryId, request }: ReplaceApiaryLayoutVariables) =>
      replaceApiaryLayout(apiaryId, request),
    retry: 0,
    onSuccess: async (_response, { apiaryId }) => {
      await queryClient.invalidateQueries({ queryKey: apiaryQueryKeys.layout(apiaryId) });
    },
  });
}
