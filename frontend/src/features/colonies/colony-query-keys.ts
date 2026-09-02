export const colonyQueryKeys = {
  all: [
    'colonies',
  ] as const,

  currentByHive: (
    hiveId: string,
  ) => [
    ...colonyQueryKeys.all,
    'current-by-hive',
    hiveId,
  ] as const,
};