export const relocationQueryKeys = {
  all: [
    'relocations',
  ] as const,

  history: (
    apiaryId: string,
  ) => [
    ...relocationQueryKeys.all,
    'history',
    apiaryId,
  ] as const,
};
