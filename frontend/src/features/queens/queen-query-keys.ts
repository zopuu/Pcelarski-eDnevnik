export const queenQueryKeys = {
  all: ['queens'] as const,

  currentByColony: (colonyId: string) =>
    [...queenQueryKeys.all, 'current-by-colony', colonyId] as const,

  stayHistory: (queenId: string) => [...queenQueryKeys.all, 'stay-history', queenId] as const,
};
