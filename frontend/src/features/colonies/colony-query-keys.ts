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

  transferDestinations: (
    colonyId: string,
  ) => [
    ...colonyQueryKeys.all,
    'transfer-destinations',
    colonyId,
  ] as const,
};
