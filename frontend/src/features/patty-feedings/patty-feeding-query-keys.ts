export const pattyFeedingQueryKeys = {
  all: ['patty-feedings'] as const,

  detail: (hiveId: string, feedingId: string) =>
    [...pattyFeedingQueryKeys.all, 'detail', hiveId, feedingId] as const,
};
