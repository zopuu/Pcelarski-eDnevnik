export const hiveSuperQueryKeys = {
  all: ['hive-supers'] as const,

  current: (hiveId: string) =>
    [...hiveSuperQueryKeys.all, 'current', hiveId] as const,
};
