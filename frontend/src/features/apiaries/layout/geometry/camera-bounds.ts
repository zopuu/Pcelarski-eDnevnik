import type { MapContentBounds, MapPoint } from './coordinates';

export const MAP_CAMERA_LIMITS = {
  minZoom: 0.5,
  maxZoom: 2.5,
  originMargin: 32,
  contentMargin: 48,
  overscroll: 48,
  settleDurationMs: 160,
} as const;

export type CameraLimits = { minX: number; maxX: number; minY: number; maxY: number };

export function getCameraLimits(
  zoom: number,
  viewport: { width: number; height: number },
  contentBounds?: MapContentBounds,
): CameraLimits {
  'worklet';
  const minX = -MAP_CAMERA_LIMITS.originMargin / zoom;
  const minY = -MAP_CAMERA_LIMITS.originMargin / zoom;

  if (!contentBounds) {
    return { minX, minY, maxX: Infinity, maxY: Infinity };
  }

  return {
    minX,
    minY,
    maxX: Math.max(
      0,
      contentBounds.x +
        contentBounds.width -
        (viewport.width - MAP_CAMERA_LIMITS.contentMargin) / zoom,
    ),
    maxY: Math.max(
      0,
      contentBounds.y +
        contentBounds.height -
        (viewport.height - MAP_CAMERA_LIMITS.contentMargin) / zoom,
    ),
  };
}

export function clampCameraPosition(position: MapPoint, limits: CameraLimits): MapPoint {
  'worklet';
  return {
    x: Math.min(limits.maxX, Math.max(limits.minX, position.x)),
    y: Math.min(limits.maxY, Math.max(limits.minY, position.y)),
  };
}

function softenAxis(value: number, minimum: number, maximum: number, overscroll: number): number {
  'worklet';
  if (value < minimum) {
    return minimum - overscroll * (1 - Math.exp((value - minimum) / overscroll));
  }
  if (value > maximum) {
    return maximum + overscroll * (1 - Math.exp((maximum - value) / overscroll));
  }
  return value;
}

export function softenCameraPosition(
  position: MapPoint,
  limits: CameraLimits,
  zoom: number,
): MapPoint {
  'worklet';
  const overscroll = MAP_CAMERA_LIMITS.overscroll / zoom;
  return {
    x: softenAxis(position.x, limits.minX, limits.maxX, overscroll),
    y: softenAxis(position.y, limits.minY, limits.maxY, overscroll),
  };
}
