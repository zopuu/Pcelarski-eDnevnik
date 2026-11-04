/* Reanimated shared values are intentionally mutated by gesture worklets. */
/* eslint-disable react-hooks/immutability */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { colors } from '@/shared/theme/colors';
import {
  measure,
  runOnJS,
  runOnUI,
  useAnimatedRef,
  useAnimatedReaction,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { ApiaryLayoutHive } from '../../types/apiary-layout';
import { viewportToLogical, windowToViewport } from '../geometry/coordinates';
import { resolveHiveFootprint } from '../geometry/hive-footprints';
import { canPlaceHive, type HivePlacement } from '../geometry/placement';
import { clampCameraPosition, getCameraLimits } from '../geometry/camera-bounds';
import { resolveMagneticPlacement, type MagneticAlignments } from '../geometry/magnetic-alignment';
import type { MapCameraValues } from '../components/map-viewport';

export type DragOrigin = 'map' | 'tray';

export type HiveDragHandlers = {
  start: (hive: ApiaryLayoutHive, origin: DragOrigin, absoluteX: number, absoluteY: number) => void;
  update: (absoluteX: number, absoluteY: number) => void;
  end: (absoluteX: number, absoluteY: number, success: boolean) => void;
  finalize: () => void;
};

type DragSession = { hive: ApiaryLayoutHive; origin: DragOrigin; generation: number };
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

const AUTO_PAN = { edgeDp: 40, maxSpeedDpPerSecond: 400 } as const;
const TRAY_DRAG_FINGER_GAP_DP = 16;

function edgeVelocity(distance: number, extent: number): number {
  'worklet';
  if (distance < AUTO_PAN.edgeDp) {
    return -AUTO_PAN.maxSpeedDpPerSecond * (1 - distance / AUTO_PAN.edgeDp);
  }
  if (extent - distance < AUTO_PAN.edgeDp) {
    return AUTO_PAN.maxSpeedDpPerSecond * (1 - (extent - distance) / AUTO_PAN.edgeDp);
  }
  return 0;
}

/** Editor-only drag state. Gesture coordinates and validity stay on the UI thread. */
export function useHiveLayoutDrag(
  placedHives: readonly HivePlacement[],
  operations: EditorOperations,
  camera: MapCameraValues,
  editingBlocked?: SharedValue<boolean>,
) {
  const rootRef = useAnimatedRef<View>();
  const mapRef = useAnimatedRef<View>();
  const trayRef = useAnimatedRef<View>();
  const [session, setSession] = useState<DragSession | null>(null);
  const [frameRunning, setFrameRunning] = useState(false);
  const [magneticEnabled, setMagneticEnabledState] = useState(true);
  const placed = useSharedValue<readonly HivePlacement[]>(placedHives);
  const magnetic = useSharedValue(true);
  const alignment = useSharedValue<MagneticAlignments | null>(null);
  const pointerX = useSharedValue(0);
  const pointerY = useSharedValue(0);
  const autoPanActive = useSharedValue(false);
  const proposedX = useSharedValue(0);
  const proposedY = useSharedValue(0);
  const proposedValid = useSharedValue(false);
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
  // Keep the source visible until both images in the floating marker have rendered.
  const previewReady = useSharedValue(false);
  const previewOpacity = useSharedValue(1);
  const previewSettled = useSharedValue(false);
  const settledX = useSharedValue(0);
  const settledY = useSharedValue(0);
  const mapOffsetX = useSharedValue(0);
  const mapOffsetY = useSharedValue(0);
  const pendingDrop = useSharedValue<PendingDrop | null>(null);
  const markerReady = useSharedValue(false);
  const dragGeneration = useSharedValue(0);

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
        previewReady.value = false;
        previewSettled.value = false;
        runOnJS(setSession)(null);
        return;
      }
      previewOpacity.value = withTiming(0, { duration: 120 }, (finished) => {
        if (!finished) return;
        locked.value = false;
        draggingHive.value = null;
        previewVisible.value = false;
        previewReady.value = false;
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

  const markPreviewReady = useCallback(
    (id: string, generation: number) => {
      runOnUI((readyId: string, readyGeneration: number) => {
        'worklet';
        if (
          !previewVisible.value ||
          draggingHive.value?.id !== readyId ||
          dragGeneration.value !== readyGeneration
        )
          return;
        previewReady.value = true;
        activeHiveId.value = readyId;
      })(id, generation);
    },
    [activeHiveId, dragGeneration, draggingHive, previewReady, previewVisible],
  );

  const handlers = useMemo<HiveDragHandlers>(() => {
    const update: HiveDragHandlers['update'] = (absoluteX, absoluteY) => {
      'worklet';
      pointerX.value = absoluteX;
      pointerY.value = absoluteY;
      const hive = draggingHive.value;
      if (!hive) return;
      const root = measure(rootRef);
      const map = measure(mapRef);
      const tray = measure(trayRef);
      if (!root || !map) return;
      const onMap = contains(absoluteX, absoluteY, map);
      const onTray = tray !== null && contains(absoluteX, absoluteY, tray);
      const scale = onMap ? camera.zoom.value : 1;
      const fingerGap = origin.value === 'tray' ? TRAY_DRAG_FINGER_GAP_DP : 0;
      previewScale.value = scale;
      previewX.value = absoluteX - root.pageX - grabX.value * scale;
      previewY.value = absoluteY - root.pageY - grabY.value * scale - fingerGap;
      if (onMap) {
        const logicalPointer = viewportToLogical(
          windowToViewport({ x: absoluteX, y: absoluteY }, { x: map.pageX, y: map.pageY }),
          { x: camera.x.value, y: camera.y.value, zoom: camera.zoom.value },
        );
        const resolved = resolveMagneticPlacement(
          hive,
          logicalPointer.x - grabX.value,
          logicalPointer.y - grabY.value - fingerGap / scale,
          logicalPointer.x,
          logicalPointer.y,
          placed.value,
          camera.zoom.value,
          magnetic.value,
          alignment.value,
        );
        alignment.value = resolved.alignment;
        proposedX.value = resolved.x;
        proposedY.value = resolved.y;
        proposedValid.value = resolved.valid;
        previewValid.value = resolved.valid;
        previewX.value = map.pageX - root.pageX + (resolved.x - camera.x.value) * scale;
        previewY.value = map.pageY - root.pageY + (resolved.y - camera.y.value) * scale;
      } else {
        alignment.value = null;
        proposedValid.value = false;
        previewValid.value = onTray && origin.value === 'map';
      }
    };

    const start: HiveDragHandlers['start'] = (hive, source, absoluteX, absoluteY) => {
      'worklet';
      if (locked.value || editingBlocked?.value) return;
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
        source === 'map' && hive.y !== null ? logicalPointer.y - hive.y : footprint.height;
      draggingHive.value = hive;
      dragGeneration.value += 1;
      origin.value = source;
      locked.value = true;
      alignment.value = null;
      autoPanActive.value = true;
      runOnJS(setFrameRunning)(true);
      previewVisible.value = true;
      previewReady.value = false;
      previewOpacity.value = 1;
      previewSettled.value = false;
      markerReady.value = false;
      const scale = source === 'map' ? camera.zoom.value : 1;
      previewScale.value = scale;
      previewX.value = absoluteX - root.pageX - grabX.value * scale;
      previewY.value =
        absoluteY -
        root.pageY -
        grabY.value * scale -
        (source === 'tray' ? TRAY_DRAG_FINGER_GAP_DP : 0);
      previewValid.value = source === 'map';
      update(absoluteX, absoluteY);
      runOnJS(setSession)({ hive, origin: source, generation: dragGeneration.value });
    };

    const end: HiveDragHandlers['end'] = (absoluteX, absoluteY, success) => {
      'worklet';
      autoPanActive.value = false;
      runOnJS(setFrameRunning)(false);
      update(absoluteX, absoluteY);
      alignment.value = null;
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
      const x = proposedX.value;
      const y = proposedY.value;
      if (proposedValid.value && canPlaceHive(hive, x, y, placed.value)) {
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
      autoPanActive.value = false;
      runOnJS(setFrameRunning)(false);
      alignment.value = null;
      if (!locked.value) return;
      if (pendingDrop.value) return;
      locked.value = false;
      draggingHive.value = null;
      activeHiveId.value = null;
      previewVisible.value = false;
      previewReady.value = false;
      previewSettled.value = false;
      runOnJS(setSession)(null);
    };

    return { start, update, end, finalize };
  }, [
    activeHiveId,
    alignment,
    autoPanActive,
    camera,
    commit,
    draggingHive,
    editingBlocked,
    dragGeneration,
    grabX,
    grabY,
    locked,
    magnetic,
    markerReady,
    mapOffsetX,
    mapOffsetY,
    mapRef,
    origin,
    pendingDrop,
    placed,
    pointerX,
    pointerY,
    proposedValid,
    proposedX,
    proposedY,
    previewScale,
    previewOpacity,
    previewReady,
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

  const setMagneticEnabled = useCallback(
    (enabled: boolean) => {
      runOnUI((nextEnabled: boolean) => {
        'worklet';
        magnetic.value = nextEnabled;
        alignment.value = null;
        if (autoPanActive.value && draggingHive.value) {
          handlers.update(pointerX.value, pointerY.value);
        }
      })(enabled);
      setMagneticEnabledState(enabled);
    },
    [alignment, autoPanActive, draggingHive, handlers, magnetic, pointerX, pointerY],
  );

  const frameCallback = useFrameCallback((frame) => {
    'worklet';
    if (!autoPanActive.value || !draggingHive.value) return;
    const map = measure(mapRef);
    if (!map || !contains(pointerX.value, pointerY.value, map)) return;
    const localX = pointerX.value - map.pageX;
    const localY = pointerY.value - map.pageY;
    const velocityX = edgeVelocity(localX, map.width);
    const velocityY = edgeVelocity(localY, map.height);
    if (velocityX === 0 && velocityY === 0) return;
    const seconds = Math.min(frame.timeSincePreviousFrame ?? 0, 50) / 1000;
    if (seconds <= 0) return;
    const zoom = camera.zoom.value;
    const limits = getCameraLimits(zoom, { width: map.width, height: map.height }, undefined, true);
    const next = clampCameraPosition(
      {
        x: camera.x.value + (velocityX * seconds) / zoom,
        y: camera.y.value + (velocityY * seconds) / zoom,
      },
      limits,
    );
    if (next.x === camera.x.value && next.y === camera.y.value) return;
    camera.x.value = next.x;
    camera.y.value = next.y;
    handlers.update(pointerX.value, pointerY.value);
  }, false);

  useEffect(() => {
    frameCallback.setActive(frameRunning);
    return () => frameCallback.setActive(false);
  }, [frameCallback, frameRunning]);

  useEffect(
    () => () => {
      runOnUI(() => {
        'worklet';
        autoPanActive.value = false;
        alignment.value = null;
      })();
    },
    [alignment, autoPanActive],
  );

  const previewStyle = useAnimatedStyle(() => ({
    opacity:
      previewVisible.value && previewReady.value
        ? previewOpacity.value * (previewSettled.value ? 1 : 0.92)
        : 0,
    left: previewSettled.value
      ? mapOffsetX.value + (settledX.value - camera.x.value) * camera.zoom.value
      : previewX.value,
    top: previewSettled.value
      ? mapOffsetY.value + (settledY.value - camera.y.value) * camera.zoom.value
      : previewY.value,
    transform: [{ scale: previewSettled.value ? camera.zoom.value : previewScale.value }],
    borderWidth: previewSettled.value ? 0 : 2,
    borderColor: previewValid.value || previewSettled.value ? 'transparent' : colors.error,
  }));

  return {
    rootRef,
    mapRef,
    trayRef,
    handlers,
    locked,
    activeHiveId,
    session,
    magneticEnabled,
    setMagneticEnabled,
    alignment,
    previewStyle,
    markMarkerReady,
    markPreviewReady,
  };
}
