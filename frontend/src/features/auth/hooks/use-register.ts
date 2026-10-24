import { useMutation } from '@tanstack/react-query';

import { registerBeekeeper } from '@/features/auth/api/register-beekeeper';

export function useRegister() {
  return useMutation({
    mutationFn: registerBeekeeper,
  });
}
