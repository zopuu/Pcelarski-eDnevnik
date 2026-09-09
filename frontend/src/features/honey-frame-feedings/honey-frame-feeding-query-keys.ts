export const honeyFrameFeedingQueryKeys = {
  all: ['honey-frame-feedings'] as const,

  detail: (hiveId: string, feedingId: string) =>
    [...honeyFrameFeedingQueryKeys.all, 'detail', hiveId, feedingId] as const,
};
