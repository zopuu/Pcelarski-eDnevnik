export const hiveQueryKeys = {
  all: [
    'hives',
  ] as const,

  byApiary: (
    apiaryId: string,
  ) =>
    [
      'hives',
      'apiary',
      apiaryId,
    ] as const,

  byId: (
    hiveId: string,
  ) =>
    [
      'hives',
      'detail',
      hiveId,
    ] as const,
};