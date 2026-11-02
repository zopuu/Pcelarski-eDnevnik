import type { ApiaryLayoutHive, ApiaryLayoutResponse } from '../types/apiary-layout';

export type PlacedApiaryLayoutHive = ApiaryLayoutHive & { x: number; y: number };
export type UnplacedApiaryLayoutHive = ApiaryLayoutHive & { x: null; y: null };

function isPlacedHive(hive: ApiaryLayoutHive): hive is PlacedApiaryLayoutHive {
  return hive.x !== null && hive.y !== null;
}

function isUnplacedHive(hive: ApiaryLayoutHive): hive is UnplacedApiaryLayoutHive {
  return hive.x === null && hive.y === null;
}

export function partitionApiaryLayoutHives(hives: readonly ApiaryLayoutHive[]): {
  placed: PlacedApiaryLayoutHive[];
  unplaced: UnplacedApiaryLayoutHive[];
} {
  const placed: PlacedApiaryLayoutHive[] = [];
  const unplaced: UnplacedApiaryLayoutHive[] = [];

  for (const hive of hives) {
    if (isPlacedHive(hive)) {
      placed.push(hive);
    } else if (isUnplacedHive(hive)) {
      unplaced.push(hive);
    } else {
      throw new Error(`Apiary layout hive ${hive.id} has only one coordinate.`);
    }
  }

  return { placed, unplaced };
}

export function getPlacedAndUnplacedHives(layout: ApiaryLayoutResponse) {
  return partitionApiaryLayoutHives(layout.hives);
}
