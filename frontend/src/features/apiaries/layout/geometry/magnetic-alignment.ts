import type { HivePlacement } from './placement';
import { canPlaceHive } from './placement';

export const MAGNETIC_ALIGNMENT = {
  activateDp: 10,
  releaseDp: 28,
} as const;

export type Alignment = { axis: 'x' | 'y'; hiveId: string; coordinate: number };

export type ResolvedPlacement = {
  x: number;
  y: number;
  valid: boolean;
  alignment: Alignment | null;
};

/** Aligns footprint left/top edges; collision validation always takes precedence. */
export function resolveMagneticPlacement(
  hive: Pick<HivePlacement, 'id' | 'hiveType'>,
  rawX: number,
  rawY: number,
  placed: readonly HivePlacement[],
  zoom: number,
  enabled: boolean,
  active: Alignment | null,
): ResolvedPlacement {
  'worklet';
  const x = Math.round(rawX);
  const y = Math.round(rawY);
  const unsnappedValid = canPlaceHive(hive, x, y, placed);
  if (!enabled) return { x, y, valid: unsnappedValid, alignment: null };

  let candidate: Alignment | null = null;
  if (active) {
    const neighbor = placed.find((other) => other.id === active.hiveId);
    const distance = Math.abs((active.axis === 'x' ? rawX : rawY) - active.coordinate);
    if (neighbor && distance * zoom <= MAGNETIC_ALIGNMENT.releaseDp) candidate = active;
  }

  if (!candidate) {
    let nearestDistance = Infinity;
    for (const other of placed) {
      if (other.id === hive.id) continue;
      for (const axis of ['y', 'x'] as const) {
        const coordinate = axis === 'x' ? other.x : other.y;
        const distance = Math.abs((axis === 'x' ? rawX : rawY) - coordinate);
        if (distance * zoom > MAGNETIC_ALIGNMENT.activateDp) continue;
        if (
          distance < nearestDistance ||
          (distance === nearestDistance &&
            candidate &&
            (axis < candidate.axis || (axis === candidate.axis && other.id < candidate.hiveId)))
        ) {
          nearestDistance = distance;
          candidate = { axis, hiveId: other.id, coordinate };
        }
      }
    }
  }

  if (candidate) {
    const snappedX = candidate.axis === 'x' ? candidate.coordinate : x;
    const snappedY = candidate.axis === 'y' ? candidate.coordinate : y;
    if (canPlaceHive(hive, snappedX, snappedY, placed)) {
      return { x: snappedX, y: snappedY, valid: true, alignment: candidate };
    }
  }
  return { x, y, valid: unsnappedValid, alignment: null };
}
