import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createApiary } from '@/features/apiaries/api/create-apiary';

export function useCreateApiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createApiary,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['apiaries'],
      });
    },
  });
}
