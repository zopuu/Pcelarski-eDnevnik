export const syrupFeedingQueryKeys = {
  all: ['syrup-feedings'] as const,

  feedingOptions: (apiaryId: string) =>
    [...syrupFeedingQueryKeys.all, 'feeding-options', apiaryId] as const,

  detail: (hiveId: string, feedingId: string) =>
    [...syrupFeedingQueryKeys.all, 'detail', hiveId, feedingId] as const,
};
