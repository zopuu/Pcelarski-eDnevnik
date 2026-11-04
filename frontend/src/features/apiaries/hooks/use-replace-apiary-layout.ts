import { useMutation, useQueryClient } from '@tanstack/react-query';

import { replaceApiaryLayout } from '../api/replace-apiary-layout';
import { apiaryQueryKeys } from '../apiary-query-keys';
import type { ApiaryLayoutResponse, ReplaceApiaryLayoutRequest } from '../types/apiary-layout';

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
    onSuccess: async (response, { apiaryId }) => {
      const queryKey = apiaryQueryKeys.layout(apiaryId);
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<ApiaryLayoutResponse>(queryKey, (current) => {
        if (!current || current.apiaryStayId !== response.apiaryStayId) return current;
        const positionsById = new Map(
          response.positions.map((position) => [position.hiveId, position]),
        );
        return {
          ...current,
          layoutId: response.layoutId,
          version: response.version,
          hives: current.hives.map((hive) => {
            const position = positionsById.get(hive.id);
            return { ...hive, x: position?.x ?? null, y: position?.y ?? null };
          }),
        };
      });
      await queryClient.invalidateQueries({ queryKey: apiaryQueryKeys.layout(apiaryId) });
    },
  });
}
