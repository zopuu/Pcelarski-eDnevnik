import type { ApiaryLayoutHive } from '../../types/apiary-layout';
import { MINIMUM_HIVE_SPACING, resolveHiveFootprint } from './hive-footprints';

export const MAX_LAYOUT_COORDINATE = 2_147_483_647;

export type HivePlacement = Pick<ApiaryLayoutHive, 'id' | 'hiveType'> & { x: number; y: number };

/** Mirrors the backend's strict rectangle comparisons: a gap of exactly 10 is valid. */
export function canPlaceHive(
  hive: Pick<ApiaryLayoutHive, 'id' | 'hiveType'>,
  x: number,
  y: number,
  placed: readonly HivePlacement[],
): boolean {
  'worklet';
  if (
    !Number.isSafeInteger(x) ||
    !Number.isSafeInteger(y) ||
    x < 0 ||
    y < 0 ||
    x > MAX_LAYOUT_COORDINATE ||
    y > MAX_LAYOUT_COORDINATE
  )
    return false;

  const footprint = resolveHiveFootprint(hive.hiveType);
  for (const other of placed) {
    if (other.id === hive.id) continue;
    const otherFootprint = resolveHiveFootprint(other.hiveType);
    if (
      x < other.x + otherFootprint.width + MINIMUM_HIVE_SPACING &&
      other.x < x + footprint.width + MINIMUM_HIVE_SPACING &&
      y < other.y + otherFootprint.height + MINIMUM_HIVE_SPACING &&
      other.y < y + footprint.height + MINIMUM_HIVE_SPACING
    )
      return false;
  }
  return true;
}
