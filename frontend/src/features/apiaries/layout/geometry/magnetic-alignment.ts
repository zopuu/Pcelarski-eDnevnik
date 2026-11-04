import { MINIMUM_HIVE_SPACING, resolveHiveFootprint } from './hive-footprints';
import type { HivePlacement } from './placement';
import { canPlaceHive } from './placement';

export const MAGNETIC_ALIGNMENT = {
  activateDp: 10,
  releaseDp: 28,
} as const;

type Axis = 'x' | 'y';
type Side = 'before' | 'after';

export type EdgeAlignment = { axis: Axis; hiveId: string; coordinate: number };
export type SpacingAlignment = {
  axis: Axis;
  side: Side;
  hiveId: string;
  coordinate: number;
  gapStart: number;
  crossCoordinate: number;
};
export type MagneticAlignments = {
  edge: EdgeAlignment | null;
  spacing: SpacingAlignment | null;
};

type SpacingTarget = Pick<SpacingAlignment, 'axis' | 'side' | 'hiveId' | 'coordinate'>;

export type ResolvedPlacement = {
  x: number;
  y: number;
  valid: boolean;
  alignment: MagneticAlignments | null;
};

function overlapsWithGap(start: number, size: number, otherStart: number, otherSize: number) {
  'worklet';
  return (
    start < otherStart + otherSize + MINIMUM_HIVE_SPACING &&
    otherStart < start + size + MINIMUM_HIVE_SPACING
  );
}

/** Holds a hive at the minimum safe gap until the finger crosses the neighbor's midpoint. */
export function resolveMagneticPlacement(
  hive: Pick<HivePlacement, 'id' | 'hiveType'>,
  rawX: number,
  rawY: number,
  pointerX: number,
  pointerY: number,
  placed: readonly HivePlacement[],
  zoom: number,
  enabled: boolean,
  active: MagneticAlignments | null,
): ResolvedPlacement {
  'worklet';
  const x = Math.round(rawX);
  const y = Math.round(rawY);
  const unsnappedValid = canPlaceHive(hive, x, y, placed);
  if (!enabled) return { x, y, valid: unsnappedValid, alignment: null };

  const footprint = resolveHiveFootprint(hive.hiveType);
  const activationDistance = MAGNETIC_ALIGNMENT.activateDp / zoom;
  const releaseDistance = MAGNETIC_ALIGNMENT.releaseDp / zoom;

  let spacingCandidate: SpacingTarget | null = null;
  if (active?.spacing) {
    const activeSpacing = active.spacing;
    const neighbor = placed.find((other) => other.id === activeSpacing.hiveId);
    if (neighbor) {
      const otherFootprint = resolveHiveFootprint(neighbor.hiveType);
      const rawCoordinate = activeSpacing.axis === 'x' ? rawX : rawY;
      const pointerCoordinate = activeSpacing.axis === 'x' ? pointerX : pointerY;
      const neighborStart = activeSpacing.axis === 'x' ? neighbor.x : neighbor.y;
      const neighborSize =
        activeSpacing.axis === 'x' ? otherFootprint.width : otherFootprint.height;
      const ownSize = activeSpacing.axis === 'x' ? footprint.width : footprint.height;
      const perpendicularNearby =
        activeSpacing.axis === 'x'
          ? overlapsWithGap(rawY, footprint.height, neighbor.y, otherFootprint.height)
          : overlapsWithGap(rawX, footprint.width, neighbor.x, otherFootprint.width);
      const side: Side = pointerCoordinate < neighborStart + neighborSize / 2 ? 'before' : 'after';
      const sameSide = side === activeSpacing.side;
      const coordinate = sameSide
        ? activeSpacing.coordinate
        : side === 'before'
          ? neighborStart - ownSize - MINIMUM_HIVE_SPACING
          : neighborStart + neighborSize + MINIMUM_HIVE_SPACING;
      const withinRelease =
        side === 'before'
          ? rawCoordinate >= coordinate - (sameSide ? releaseDistance : activationDistance) &&
            (sameSide || rawCoordinate < neighborStart + neighborSize + MINIMUM_HIVE_SPACING)
          : rawCoordinate <= coordinate + (sameSide ? releaseDistance : activationDistance) &&
            (sameSide || rawCoordinate > neighborStart - ownSize - MINIMUM_HIVE_SPACING);
      const snappedX = activeSpacing.axis === 'x' ? coordinate : x;
      const snappedY = activeSpacing.axis === 'y' ? coordinate : y;
      if (perpendicularNearby && withinRelease && canPlaceHive(hive, snappedX, snappedY, placed)) {
        spacingCandidate = { axis: activeSpacing.axis, side, hiveId: neighbor.id, coordinate };
      }
    }
  }

  let spacingDistance = Infinity;
  if (!spacingCandidate) {
    for (const other of placed) {
      if (other.id === hive.id) continue;
      const otherFootprint = resolveHiveFootprint(other.hiveType);
      for (const axis of ['x', 'y'] as const) {
        const ownSize = axis === 'x' ? footprint.width : footprint.height;
        const otherStart = axis === 'x' ? other.x : other.y;
        const otherSize = axis === 'x' ? otherFootprint.width : otherFootprint.height;
        const rawCoordinate = axis === 'x' ? rawX : rawY;
        const pointerCoordinate = axis === 'x' ? pointerX : pointerY;
        const perpendicularNearby =
          axis === 'x'
            ? overlapsWithGap(rawY, footprint.height, other.y, otherFootprint.height)
            : overlapsWithGap(rawX, footprint.width, other.x, otherFootprint.width);
        if (!perpendicularNearby) continue;

        const side: Side = pointerCoordinate < otherStart + otherSize / 2 ? 'before' : 'after';
        const coordinate =
          side === 'before'
            ? otherStart - ownSize - MINIMUM_HIVE_SPACING
            : otherStart + otherSize + MINIMUM_HIVE_SPACING;
        const nearSpacing =
          side === 'before'
            ? rawCoordinate >= coordinate - activationDistance &&
              rawCoordinate < otherStart + otherSize + MINIMUM_HIVE_SPACING
            : rawCoordinate <= coordinate + activationDistance &&
              rawCoordinate > otherStart - ownSize - MINIMUM_HIVE_SPACING;
        if (!nearSpacing) continue;

        const distance = Math.abs(rawCoordinate - coordinate);
        if (distance >= spacingDistance) continue;
        const snappedX = axis === 'x' ? coordinate : x;
        const snappedY = axis === 'y' ? coordinate : y;
        if (!canPlaceHive(hive, snappedX, snappedY, placed)) continue;
        spacingCandidate = { axis, side, hiveId: other.id, coordinate };
        spacingDistance = distance;
      }
    }
  }

  const baseX = spacingCandidate?.axis === 'x' ? spacingCandidate.coordinate : x;
  const baseY = spacingCandidate?.axis === 'y' ? spacingCandidate.coordinate : y;
  let edgeCandidate: EdgeAlignment | null = null;
  if (active?.edge && active.edge.axis !== spacingCandidate?.axis) {
    const activeEdge = active.edge;
    const neighbor = placed.find((other) => other.id === activeEdge.hiveId);
    const distance = Math.abs((activeEdge.axis === 'x' ? rawX : rawY) - activeEdge.coordinate);
    const edgeX = activeEdge.axis === 'x' ? activeEdge.coordinate : baseX;
    const edgeY = activeEdge.axis === 'y' ? activeEdge.coordinate : baseY;
    if (neighbor && distance <= releaseDistance && canPlaceHive(hive, edgeX, edgeY, placed)) {
      edgeCandidate = activeEdge;
    }
  }

  if (!edgeCandidate) {
    let nearestDistance = Infinity;
    for (const other of placed) {
      if (other.id === hive.id) continue;
      for (const axis of ['y', 'x'] as const) {
        if (axis === spacingCandidate?.axis) continue;
        const coordinate = axis === 'x' ? other.x : other.y;
        const distance = Math.abs((axis === 'x' ? rawX : rawY) - coordinate);
        if (distance > activationDistance) continue;
        const edgeX = axis === 'x' ? coordinate : baseX;
        const edgeY = axis === 'y' ? coordinate : baseY;
        if (!canPlaceHive(hive, edgeX, edgeY, placed)) continue;
        if (
          distance < nearestDistance ||
          (distance === nearestDistance &&
            edgeCandidate &&
            (axis < edgeCandidate.axis ||
              (axis === edgeCandidate.axis && other.id < edgeCandidate.hiveId)))
        ) {
          nearestDistance = distance;
          edgeCandidate = { axis, hiveId: other.id, coordinate };
        }
      }
    }
  }

  const resolvedX = edgeCandidate?.axis === 'x' ? edgeCandidate.coordinate : baseX;
  const resolvedY = edgeCandidate?.axis === 'y' ? edgeCandidate.coordinate : baseY;
  let spacing: SpacingAlignment | null = null;
  if (spacingCandidate) {
    const neighbor = placed.find((other) => other.id === spacingCandidate.hiveId);
    if (neighbor) {
      const otherFootprint = resolveHiveFootprint(neighbor.hiveType);
      const alongSize = spacingCandidate.axis === 'x' ? footprint.width : footprint.height;
      const crossSize = spacingCandidate.axis === 'x' ? footprint.height : footprint.width;
      const otherCrossSize =
        spacingCandidate.axis === 'x' ? otherFootprint.height : otherFootprint.width;
      const movedCross = spacingCandidate.axis === 'x' ? resolvedY : resolvedX;
      const otherCross = spacingCandidate.axis === 'x' ? neighbor.y : neighbor.x;
      spacing = {
        ...spacingCandidate,
        gapStart:
          spacingCandidate.side === 'before'
            ? spacingCandidate.coordinate + alongSize
            : spacingCandidate.coordinate - MINIMUM_HIVE_SPACING,
        crossCoordinate:
          (Math.max(movedCross, otherCross) +
            Math.min(movedCross + crossSize, otherCross + otherCrossSize)) /
          2,
      };
    }
  }
  return {
    x: resolvedX,
    y: resolvedY,
    valid: spacing !== null || edgeCandidate !== null || unsnappedValid,
    alignment: spacing || edgeCandidate ? { edge: edgeCandidate, spacing } : null,
  };
}
