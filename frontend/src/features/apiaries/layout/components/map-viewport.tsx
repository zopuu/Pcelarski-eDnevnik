import { createContext, useContext, useState, type ReactNode, type Ref } from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector, type GestureType } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import {
  clampCameraPosition,
  getCameraLimits,
  MAP_CAMERA_LIMITS,
  softenCameraPosition,
} from '../geometry/camera-bounds';
import {
  INITIAL_MAP_CAMERA,
  viewportToLogical,
  type MapContentBounds,
} from '../geometry/coordinates';

export type MapViewportProps = {
  /** Children use absolute positions in logical map units. */
  children?: ReactNode;
  overlay?: ReactNode;
  /** Union of child footprints, used to limit panning past visible content. */
  contentBounds?: MapContentBounds;
  /** Allows an editing host to navigate beyond currently positioned content. */
  extendPositiveCanvas?: boolean;
  /** The host supplies height; the viewport fills its available width. */
  style?: StyleProp<ViewStyle>;
  /** Pass the host scroll gesture when the map is nested in a scrollable screen. */
  parentScrollGesture?: GestureType;
  /** Optional editor access to the same camera used by the viewport renderer. */
  cameraValues?: MapCameraValues;
  interactionLocked?: SharedValue<boolean>;
  viewportRef?: Ref<View>;
};

export type MapCameraValues = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  zoom: SharedValue<number>;
};

const MapGesturesContext = createContext<{ pan: GestureType; pinch: GestureType } | null>(null);

/** Lets nested marker taps defer to this viewport's camera gestures. */
export function useMapViewportGestures() {
  return useContext(MapGesturesContext);
}

function updateViewportSize(
  width: number,
  height: number,
  viewportWidth: SharedValue<number>,
  viewportHeight: SharedValue<number>,
  cameraX: SharedValue<number>,
  cameraY: SharedValue<number>,
  zoom: SharedValue<number>,
  contentBounds?: MapContentBounds,
) {
  viewportWidth.value = width;
  viewportHeight.value = height;
  const limits = getCameraLimits(zoom.value, { width, height }, contentBounds);
  const settled = clampCameraPosition({ x: cameraX.value, y: cameraY.value }, limits);
  cameraX.value = settled.x;
  cameraY.value = settled.y;
}

export function MapViewport({
  children,
  overlay,
  contentBounds,
  extendPositiveCanvas = false,
  style,
  parentScrollGesture,
  cameraValues,
  interactionLocked,
  viewportRef,
}: MapViewportProps) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const viewportWidth = useSharedValue(0);
  const viewportHeight = useSharedValue(0);
  const localCameraX = useSharedValue(INITIAL_MAP_CAMERA.x);
  const localCameraY = useSharedValue(INITIAL_MAP_CAMERA.y);
  const panRawX = useSharedValue(INITIAL_MAP_CAMERA.x);
  const panRawY = useSharedValue(INITIAL_MAP_CAMERA.y);
  const localZoom = useSharedValue(INITIAL_MAP_CAMERA.zoom);
  const cameraX = cameraValues?.x ?? localCameraX;
  const cameraY = cameraValues?.y ?? localCameraY;
  const zoom = cameraValues?.zoom ?? localZoom;
  const isPanning = useSharedValue(false);
  const isPinching = useSharedValue(false);
  const cameraBounds = extendPositiveCanvas ? undefined : contentBounds;
  const pinchStartZoom = useSharedValue(INITIAL_MAP_CAMERA.zoom);
  const pinchAnchorX = useSharedValue(0);
  const pinchAnchorY = useSharedValue(0);

  const settleCamera = () => {
    'worklet';
    const limits = getCameraLimits(
      zoom.value,
      { width: viewportWidth.value, height: viewportHeight.value },
      cameraBounds,
    );
    const settled = clampCameraPosition({ x: cameraX.value, y: cameraY.value }, limits);
    cameraX.value = withTiming(settled.x, { duration: MAP_CAMERA_LIMITS.settleDurationMs });
    cameraY.value = withTiming(settled.y, { duration: MAP_CAMERA_LIMITS.settleDurationMs });
  };

  const pan = Gesture.Pan()
    .minDistance(4)
    .maxPointers(1)
    .averageTouches(true)
    .onStart(() => {
      if (interactionLocked?.value) return;
      cancelAnimation(cameraX);
      cancelAnimation(cameraY);
      isPanning.value = true;
      panRawX.value = cameraX.value;
      panRawY.value = cameraY.value;
    })
    .onChange((event) => {
      if (interactionLocked?.value || isPinching.value || event.numberOfPointers !== 1) return;
      panRawX.value -= event.changeX / zoom.value;
      panRawY.value -= event.changeY / zoom.value;
      const next = {
        x: panRawX.value,
        y: panRawY.value,
      };
      const limits = getCameraLimits(
        zoom.value,
        { width: viewportWidth.value, height: viewportHeight.value },
        cameraBounds,
      );
      const softened = softenCameraPosition(next, limits, zoom.value);
      cameraX.value = softened.x;
      cameraY.value = softened.y;
    })
    .onFinalize(() => {
      isPanning.value = false;
      if (!interactionLocked?.value && !isPinching.value) settleCamera();
    });

  const pinch = Gesture.Pinch()
    .onStart((event) => {
      if (interactionLocked?.value) return;
      cancelAnimation(cameraX);
      cancelAnimation(cameraY);
      isPinching.value = true;
      pinchStartZoom.value = zoom.value;
      const anchor = viewportToLogical(
        { x: event.focalX, y: event.focalY },
        { x: cameraX.value, y: cameraY.value, zoom: zoom.value },
      );
      pinchAnchorX.value = anchor.x;
      pinchAnchorY.value = anchor.y;
    })
    .onUpdate((event) => {
      if (interactionLocked?.value) return;
      const nextZoom = Math.min(
        MAP_CAMERA_LIMITS.maxZoom,
        Math.max(MAP_CAMERA_LIMITS.minZoom, pinchStartZoom.value * event.scale),
      );
      const next = {
        x: pinchAnchorX.value - event.focalX / nextZoom,
        y: pinchAnchorY.value - event.focalY / nextZoom,
      };
      const limits = getCameraLimits(
        nextZoom,
        { width: viewportWidth.value, height: viewportHeight.value },
        cameraBounds,
      );
      const softened = softenCameraPosition(next, limits, nextZoom);
      zoom.value = nextZoom;
      cameraX.value = softened.x;
      cameraY.value = softened.y;
    })
    .onFinalize(() => {
      isPinching.value = false;
      panRawX.value = cameraX.value;
      panRawY.value = cameraY.value;
      if (!interactionLocked?.value && !isPanning.value) settleCamera();
    });

  if (parentScrollGesture) {
    pan.blocksExternalGesture(parentScrollGesture);
    pinch.blocksExternalGesture(parentScrollGesture);
  }

  const gesture = Gesture.Simultaneous(pan, pinch);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -cameraX.value * zoom.value },
      { translateY: -cameraY.value * zoom.value },
      { scale: zoom.value },
    ],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    updateViewportSize(
      width,
      height,
      viewportWidth,
      viewportHeight,
      cameraX,
      cameraY,
      zoom,
      cameraBounds,
    );
    setViewport((previous) =>
      previous.width === width && previous.height === height ? previous : { width, height },
    );
  };

  const handleContentLayout = () => {
    if (viewport.width <= 0 || viewport.height <= 0) return;
    updateViewportSize(
      viewport.width,
      viewport.height,
      viewportWidth,
      viewportHeight,
      cameraX,
      cameraY,
      zoom,
      cameraBounds,
    );
  };

  const contentWidth = Math.max(
    viewport.width,
    (contentBounds?.x ?? 0) + (contentBounds?.width ?? 0),
  );
  const contentHeight = Math.max(
    viewport.height,
    (contentBounds?.y ?? 0) + (contentBounds?.height ?? 0),
  );

  return (
    <GestureDetector gesture={gesture}>
      <View
        ref={viewportRef}
        collapsable={false}
        onLayout={handleLayout}
        style={[styles.viewport, style]}
      >
        <Animated.View
          onLayout={handleContentLayout}
          pointerEvents="box-none"
          style={[styles.content, { width: contentWidth, height: contentHeight }, contentStyle]}
        >
          <MapGesturesContext.Provider value={{ pan, pinch }}>
            {children}
          </MapGesturesContext.Provider>
        </Animated.View>
        {overlay}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  viewport: {
    width: '100%',
    overflow: 'hidden',
  },
  content: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'visible',
    transformOrigin: [0, 0, 0],
  },
});
