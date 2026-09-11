import { useQuery } from '@tanstack/react-query';
import { getHoneyBatchById } from '../api/get-honey-batch-by-id';
import { honeyBatchQueryKeys } from '../query-keys';

export function useHoneyBatch(batchId?: string) {
  return useQuery({
    queryKey: honeyBatchQueryKeys.detail(batchId ?? 'missing'),
    queryFn: () => getHoneyBatchById(batchId!),
    enabled: Boolean(batchId),
  });
}
