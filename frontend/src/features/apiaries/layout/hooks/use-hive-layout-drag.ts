/* Reanimated shared values are intentionally mutated by gesture worklets. */
/* eslint-disable react-hooks/immutability */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { View } from 'react-native';
import { colors } from '@/shared/theme/colors';
import {
  measure,
  runOnJS,
  runOnUI,
  useAnimatedRef,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { ApiaryLayoutHive } from '../../types/apiary-layout';
import { viewportToLogical, windowToViewport } from '../geometry/coordinates';
import { resolveHiveFootprint } from '../geometry/hive-footprints';
import { canPlaceHive, type HivePlacement } from '../geometry/placement';
import type { MapCameraValues } from '../components/map-viewport';

export type DragOrigin = 'map' | 'tray';

export type HiveDragHandlers = {
  start: (hive: ApiaryLayoutHive, origin: DragOrigin, absoluteX: number, absoluteY: number) => void;
  update: (absoluteX: number, absoluteY: number) => void;
  end: (absoluteX: number, absoluteY: number, success: boolean) => void;
  finalize: () => void;
};

type DragSession = { hive: ApiaryLayoutHive; origin: DragOrigin };
type PendingDrop = { id: string; target: 'map' | 'tray'; x: number; y: number };
type EditorOperations = {
  placeHive: (id: string, x: number, y: number) => void;
  moveHive: (id: string, x: number, y: number) => void;
  removeHive: (id: string) => void;
};

function contains(
  x: number,
  y: number,
  bounds: { pageX: number; pageY: number; width: number; height: number },
) {
  'worklet';
  return (
    x >= bounds.pageX &&
    y >= bounds.pageY &&
    x < bounds.pageX + bounds.width &&
    y < bounds.pageY + bounds.height
  );
}

/** Editor-only drag state. Gesture coordinates and validity stay on the UI thread. */
export function useHiveLayoutDrag(
  placedHives: readonly HivePlacement[],
  operations: EditorOperations,
  camera: MapCameraValues,
) {
  const rootRef = useAnimatedRef<View>();
  const mapRef = useAnimatedRef<View>();
  const trayRef = useAnimatedRef<View>();
  const [session, setSession] = useState<DragSession | null>(null);
  const placed = useSharedValue<readonly HivePlacement[]>(placedHives);
  const locked = useSharedValue(false);
  const activeHiveId = useSharedValue<string | null>(null);
  const draggingHive = useSharedValue<ApiaryLayoutHive | null>(null);
  const origin = useSharedValue<DragOrigin>('tray');
  const grabX = useSharedValue(0);
  const grabY = useSharedValue(0);
  const previewX = useSharedValue(0);
  const previewY = useSharedValue(0);
  const previewScale = useSharedValue(1);
  const previewValid = useSharedValue(false);
  const previewVisible = useSharedValue(false);
  const previewOpacity = useSharedValue(1);
  const previewSettled = useSharedValue(false);
  const settledX = useSharedValue(0);
  const settledY = useSharedValue(0);
  const mapOffsetX = useSharedValue(0);
  const mapOffsetY = useSharedValue(0);
  const pendingDrop = useSharedValue<PendingDrop | null>(null);
  const markerReady = useSharedValue(false);

  useEffect(() => {
    placed.value = placedHives;
  }, [placed, placedHives]);

  // A committed position can precede the native marker layout and image display.
  useAnimatedReaction(
    () => ({ pending: pendingDrop.value, positions: placed.value, ready: markerReady.value }),
    ({ pending, positions, ready }) => {
      if (!pending) return;
      const position = positions.find((hive) => hive.id === pending.id);
      const committed =
        pending.target === 'tray'
          ? position === undefined
          : ready && position?.x === pending.x && position.y === pending.y;
      if (!committed) return;
      pendingDrop.value = null;
      markerReady.value = false;
      activeHiveId.value = null;
      if (pending.target === 'tray') {
        locked.value = false;
        draggingHive.value = null;
        previewVisible.value = false;
        previewSettled.value = false;
        runOnJS(setSession)(null);
        return;
      }
      previewOpacity.value = withTiming(0, { duration: 120 }, (finished) => {
        if (!finished) return;
        locked.value = false;
        draggingHive.value = null;
        previewVisible.value = false;
        previewSettled.value = false;
        runOnJS(setSession)(null);
      });
    },
  );

  const commit = useCallback(
    (id: string, source: DragOrigin, target: 'map' | 'tray', x: number, y: number) => {
      if (target === 'tray') operations.removeHive(id);
      else if (source === 'tray') operations.placeHive(id, x, y);
      else operations.moveHive(id, x, y);
    },
    [operations],
  );

  const markMarkerReady = useCallback(
    (id: string, x: number, y: number) => {
      runOnUI((readyId: string, readyX: number, readyY: number) => {
        'worklet';
        const pending = pendingDrop.value;
        if (
          pending?.target === 'map' &&
          pending.id === readyId &&
          pending.x === readyX &&
          pending.y === readyY
        ) {
          markerReady.value = true;
        }
      })(id, x, y);
    },
    [markerReady, pendingDrop],
  );

  const handlers = useMemo<HiveDragHandlers>(() => {
    const start: HiveDragHandlers['start'] = (hive, source, absoluteX, absoluteY) => {
      'worklet';
      if (locked.value) return;
      const root = measure(rootRef);
      const map = measure(mapRef);
      if (!root || !map) return;
      const footprint = resolveHiveFootprint(hive.hiveType);
      const cameraNow = { x: camera.x.value, y: camera.y.value, zoom: camera.zoom.value };
      const logicalPointer = viewportToLogical(
        windowToViewport({ x: absoluteX, y: absoluteY }, { x: map.pageX, y: map.pageY }),
        cameraNow,
      );
      grabX.value =
        source === 'map' && hive.x !== null ? logicalPointer.x - hive.x : footprint.width / 2;
      grabY.value =
        source === 'map' && hive.y !== null ? logicalPointer.y - hive.y : footprint.height / 2;
      draggingHive.value = hive;
      activeHiveId.value = hive.id;
      origin.value = source;
      locked.value = true;
      previewVisible.value = true;
      previewOpacity.value = 1;
      previewSettled.value = false;
      markerReady.value = false;
      const scale = source === 'map' ? camera.zoom.value : 1;
      previewScale.value = scale;
      previewX.value = absoluteX - root.pageX - grabX.value * scale;
      previewY.value = absoluteY - root.pageY - grabY.value * scale;
      previewValid.value = source === 'map';
      runOnJS(setSession)({ hive, origin: source });
    };

    const update: HiveDragHandlers['update'] = (absoluteX, absoluteY) => {
      'worklet';
      const hive = draggingHive.value;
      if (!hive) return;
      const root = measure(rootRef);
      const map = measure(mapRef);
      const tray = measure(trayRef);
      if (!root || !map) return;
      const onMap = contains(absoluteX, absoluteY, map);
      const onTray = tray !== null && contains(absoluteX, absoluteY, tray);
      const scale = onMap ? camera.zoom.value : 1;
      previewScale.value = scale;
      previewX.value = absoluteX - root.pageX - grabX.value * scale;
      previewY.value = absoluteY - root.pageY - grabY.value * scale;
      if (onMap) {
        const logicalPointer = viewportToLogical(
          windowToViewport({ x: absoluteX, y: absoluteY }, { x: map.pageX, y: map.pageY }),
          { x: camera.x.value, y: camera.y.value, zoom: camera.zoom.value },
        );
        previewValid.value = canPlaceHive(
          hive,
          Math.round(logicalPointer.x - grabX.value),
          Math.round(logicalPointer.y - grabY.value),
          placed.value,
        );
      } else {
        previewValid.value = onTray && origin.value === 'map';
      }
    };

    const end: HiveDragHandlers['end'] = (absoluteX, absoluteY, success) => {
      'worklet';
      const hive = draggingHive.value;
      if (!hive || !success) return;
      const map = measure(mapRef);
      const tray = measure(trayRef);
      if (origin.value === 'map' && tray && contains(absoluteX, absoluteY, tray)) {
        pendingDrop.value = { id: hive.id, target: 'tray', x: 0, y: 0 };
        runOnJS(commit)(hive.id, origin.value, 'tray', 0, 0);
        return;
      }
      if (!map || !contains(absoluteX, absoluteY, map)) return;
      const logicalPointer = viewportToLogical(
        windowToViewport({ x: absoluteX, y: absoluteY }, { x: map.pageX, y: map.pageY }),
        { x: camera.x.value, y: camera.y.value, zoom: camera.zoom.value },
      );
      const x = Math.round(logicalPointer.x - grabX.value);
      const y = Math.round(logicalPointer.y - grabY.value);
      if (canPlaceHive(hive, x, y, placed.value)) {
        if (origin.value === 'map' && hive.x === x && hive.y === y) return;
        const root = measure(rootRef);
        if (root) {
          settledX.value = x;
          settledY.value = y;
          mapOffsetX.value = map.pageX - root.pageX;
          mapOffsetY.value = map.pageY - root.pageY;
          previewSettled.value = true;
        }
        pendingDrop.value = { id: hive.id, target: 'map', x, y };
        runOnJS(commit)(hive.id, origin.value, 'map', x, y);
      }
    };

    const finalize = () => {
      'worklet';
      if (!locked.value) return;
      if (pendingDrop.value) return;
      locked.value = false;
      draggingHive.value = null;
      activeHiveId.value = null;
      previewVisible.value = false;
      previewSettled.value = false;
      runOnJS(setSession)(null);
    };

    return { start, update, end, finalize };
  }, [
    activeHiveId,
    camera,
    commit,
    draggingHive,
    grabX,
    grabY,
    locked,
    markerReady,
    mapOffsetX,
    mapOffsetY,
    mapRef,
    origin,
    pendingDrop,
    placed,
    previewScale,
    previewOpacity,
    previewSettled,
    previewValid,
    previewVisible,
    previewX,
    previewY,
    rootRef,
    settledX,
    settledY,
    trayRef,
  ]);

  const previewStyle = useAnimatedStyle(() => ({
    opacity: previewVisible.value ? previewOpacity.value * (previewSettled.value ? 1 : 0.92) : 0,
    left: previewSettled.value
      ? mapOffsetX.value + (settledX.value - camera.x.value) * camera.zoom.value
      : previewX.value,
    top: previewSettled.value
      ? mapOffsetY.value + (settledY.value - camera.y.value) * camera.zoom.value
      : previewY.value,
    transform: [{ scale: previewSettled.value ? camera.zoom.value : previewScale.value }],
    borderWidth: previewSettled.value ? 0 : 2,
    borderColor: previewValid.value || previewSettled.value ? 'transparent' : colors.error,
    backgroundColor: previewSettled.value ? 'transparent' : colors.surface,
    elevation: previewSettled.value ? 0 : 8,
  }));

  return {
    rootRef,
    mapRef,
    trayRef,
    handlers,
    locked,
    activeHiveId,
    session,
    previewStyle,
    markMarkerReady,
  };
}
