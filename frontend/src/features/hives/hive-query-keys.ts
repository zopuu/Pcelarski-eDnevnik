export const hiveQueryKeys = {
  all: [
    'hives',
  ] as const,

  lists: () => [
    ...hiveQueryKeys.all,
    'list',
  ] as const,

  list: (
    apiaryId: string,
  ) => [
    ...hiveQueryKeys.lists(),
    apiaryId,
  ] as const,

  details: () => [
    ...hiveQueryKeys.all,
    'detail',
  ] as const,

  detail: (
    hiveId: string,
  ) => [
    ...hiveQueryKeys.details(),
    hiveId,
  ] as const,
};