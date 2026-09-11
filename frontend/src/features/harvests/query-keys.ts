export const harvestQueryKeys = {
  all: ['harvests'] as const,
  lists: () => [...harvestQueryKeys.all, 'list'] as const,
  list: (pageSize: number) =>
    [...harvestQueryKeys.lists(), { pageSize }] as const,
  details: () => [...harvestQueryKeys.all, 'detail'] as const,
  detail: (harvestId: string) =>
    [...harvestQueryKeys.details(), harvestId] as const,
  availableGroups: () =>
    [...harvestQueryKeys.all, 'available-groups'] as const,
};

export const honeyBatchQueryKeys = {
  all: ['honey-batches'] as const,
  lists: () => [...honeyBatchQueryKeys.all, 'list'] as const,
  list: (pageSize: number) =>
    [...honeyBatchQueryKeys.lists(), { pageSize }] as const,
  details: () => [...honeyBatchQueryKeys.all, 'detail'] as const,
  detail: (batchId: string) =>
    [...honeyBatchQueryKeys.details(), batchId] as const,
};
