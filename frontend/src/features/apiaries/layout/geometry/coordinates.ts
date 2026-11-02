export type MapPoint = { x: number; y: number };

export type MapCamera = MapPoint & { zoom: number };

export type MapContentBounds = MapPoint & { width: number; height: number };

export const INITIAL_MAP_CAMERA: MapCamera = { x: 0, y: 0, zoom: 1 };

export function logicalToViewport(point: MapPoint, camera: MapCamera): MapPoint {
  'worklet';
  return {
    x: (point.x - camera.x) * camera.zoom,
    y: (point.y - camera.y) * camera.zoom,
  };
}

export function viewportToLogical(point: MapPoint, camera: MapCamera): MapPoint {
  'worklet';
  return {
    x: point.x / camera.zoom + camera.x,
    y: point.y / camera.zoom + camera.y,
  };
}

export function windowToViewport(point: MapPoint, viewportOrigin: MapPoint): MapPoint {
  'worklet';
  return {
    x: point.x - viewportOrigin.x,
    y: point.y - viewportOrigin.y,
  };
}
