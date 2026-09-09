export const hiveActionQueryKeys = {
  all: ['hive-actions'] as const,

  byHive: (hiveId: string) =>
    [...hiveActionQueryKeys.all, 'hive', hiveId] as const,

  history: (hiveId: string) =>
    [...hiveActionQueryKeys.byHive(hiveId), 'history'] as const,
};
