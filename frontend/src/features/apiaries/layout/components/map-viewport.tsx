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
  /** Pass the host scroll handler or ref when the map is nested in a scrollable screen. */
  parentScrollGesture?: ParentScrollGesture;
  /** Optional editor access to the same camera used by the viewport renderer. */
  cameraValues?: MapCameraValues;
  interactionLocked?: SharedValue<boolean>;
  /** Called on the UI thread when a second touch cancels an editor drag. */
  onMultiTouchStart?: () => void;
  viewportRef?: Ref<View>;
};

export type MapCameraValues = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  zoom: SharedValue<number>;
};

export type ParentScrollGesture = Parameters<
  ReturnType<typeof Gesture.Pan>['blocksExternalGesture']
>[0];

const MapGesturesContext = createContext<{
  pan: GestureType;
  pinch: GestureType;
  twoFingerPan: GestureType;
  isPanning: SharedValue<boolean>;
  multiTouchActive: SharedValue<boolean>;
  touchSequence: SharedValue<number>;
} | null>(null);

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
  extendPositiveCanvas = false,
) {
  viewportWidth.value = width;
  viewportHeight.value = height;
  const limits = getCameraLimits(
    zoom.value,
    { width, height },
    contentBounds,
    extendPositiveCanvas,
  );
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
  onMultiTouchStart,
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
  const isTwoFingerPanning = useSharedValue(false);
  const multiTouchActive = useSharedValue(false);
  const touchSequence = useSharedValue(0);
  const panStartSequence = useSharedValue(0);
  const twoFingerTranslationX = useSharedValue(0);
  const twoFingerTranslationY = useSharedValue(0);
  const multiTouchCenterX = useSharedValue(0);
  const multiTouchCenterY = useSharedValue(0);
  const multiTouchPanX = useSharedValue(0);
  const multiTouchPanY = useSharedValue(0);
  const multiTouchZoom = useSharedValue(INITIAL_MAP_CAMERA.zoom);
  const cameraBounds = extendPositiveCanvas ? undefined : contentBounds;
  const pinchStartZoom = useSharedValue(INITIAL_MAP_CAMERA.zoom);

  const settleCamera = () => {
    'worklet';
    const limits = getCameraLimits(
      zoom.value,
      { width: viewportWidth.value, height: viewportHeight.value },
      cameraBounds,
      extendPositiveCanvas,
    );
    const settled = clampCameraPosition({ x: cameraX.value, y: cameraY.value }, limits);
    cameraX.value = withTiming(settled.x, { duration: MAP_CAMERA_LIMITS.settleDurationMs });
    cameraY.value = withTiming(settled.y, { duration: MAP_CAMERA_LIMITS.settleDurationMs });
  };

  const beginMultiTouch = () => {
    'worklet';
    if (multiTouchActive.value) return;
    multiTouchActive.value = true;
    touchSequence.value += 1;
    cancelAnimation(cameraX);
    cancelAnimation(cameraY);
    const center = viewportToLogical(
      { x: viewportWidth.value / 2, y: viewportHeight.value / 2 },
      { x: cameraX.value, y: cameraY.value, zoom: zoom.value },
    );
    multiTouchCenterX.value = center.x;
    multiTouchCenterY.value = center.y;
    multiTouchPanX.value = 0;
    multiTouchPanY.value = 0;
    multiTouchZoom.value = zoom.value;
    onMultiTouchStart?.();
  };

  const updateMultiTouchCamera = () => {
    'worklet';
    const nextZoom = multiTouchZoom.value;
    const next = {
      x: multiTouchCenterX.value - (viewportWidth.value / 2 + multiTouchPanX.value) / nextZoom,
      y: multiTouchCenterY.value - (viewportHeight.value / 2 + multiTouchPanY.value) / nextZoom,
    };
    const limits = getCameraLimits(
      nextZoom,
      { width: viewportWidth.value, height: viewportHeight.value },
      cameraBounds,
      extendPositiveCanvas,
    );
    const position = extendPositiveCanvas ? next : softenCameraPosition(next, limits, nextZoom);
    zoom.value = nextZoom;
    cameraX.value = position.x;
    cameraY.value = position.y;
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
      panStartSequence.value = touchSequence.value;
      panRawX.value = cameraX.value;
      panRawY.value = cameraY.value;
    })
    .onChange((event) => {
      if (
        interactionLocked?.value ||
        isPinching.value ||
        multiTouchActive.value ||
        panStartSequence.value !== touchSequence.value ||
        event.numberOfPointers !== 1
      )
        return;
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
        extendPositiveCanvas,
      );
      const softened = softenCameraPosition(next, limits, zoom.value);
      cameraX.value = softened.x;
      cameraY.value = softened.y;
    })
    .onFinalize(() => {
      isPanning.value = false;
      if (
        !interactionLocked?.value &&
        !isPinching.value &&
        !multiTouchActive.value &&
        panStartSequence.value === touchSequence.value
      )
        settleCamera();
    });

  const twoFingerPan = Gesture.Pan()
    .minPointers(2)
    .minDistance(0)
    .averageTouches(true)
    .onTouchesDown((event) => {
      if (event.numberOfTouches >= 2) beginMultiTouch();
    })
    .onStart((event) => {
      beginMultiTouch();
      twoFingerTranslationX.value = event.translationX;
      twoFingerTranslationY.value = event.translationY;
      if (interactionLocked?.value) return;
      isTwoFingerPanning.value = true;
    })
    .onUpdate((event) => {
      if (!isTwoFingerPanning.value || interactionLocked?.value || event.numberOfPointers !== 2)
        return;
      multiTouchPanX.value = event.translationX - twoFingerTranslationX.value;
      multiTouchPanY.value = event.translationY - twoFingerTranslationY.value;
      updateMultiTouchCamera();
    })
    .onFinalize(() => {
      isTwoFingerPanning.value = false;
      if (!isPinching.value) multiTouchActive.value = false;
      if (!interactionLocked?.value && !isPinching.value && !extendPositiveCanvas) settleCamera();
    });

  const pinch = Gesture.Pinch()
    .onTouchesDown((event) => {
      if (event.numberOfTouches >= 2) beginMultiTouch();
    })
    .onTouchesUp((event) => {
      if (event.numberOfTouches === 0) multiTouchActive.value = false;
    })
    .onTouchesCancelled((event) => {
      if (event.numberOfTouches === 0) multiTouchActive.value = false;
    })
    .onStart(() => {
      beginMultiTouch();
      if (interactionLocked?.value) return;
      isPinching.value = true;
      pinchStartZoom.value = multiTouchZoom.value;
    })
    .onUpdate((event) => {
      if (!isPinching.value || interactionLocked?.value) return;
      multiTouchZoom.value = Math.min(
        MAP_CAMERA_LIMITS.maxZoom,
        Math.max(MAP_CAMERA_LIMITS.minZoom, pinchStartZoom.value * event.scale),
      );
      updateMultiTouchCamera();
    })
    .onFinalize(() => {
      isPinching.value = false;
      if (!isTwoFingerPanning.value) multiTouchActive.value = false;
      panRawX.value = cameraX.value;
      panRawY.value = cameraY.value;
      if (
        !interactionLocked?.value &&
        !isPanning.value &&
        !isTwoFingerPanning.value &&
        !extendPositiveCanvas
      )
        settleCamera();
    });

  if (parentScrollGesture) {
    pan.blocksExternalGesture(parentScrollGesture);
    pinch.blocksExternalGesture(parentScrollGesture);
    twoFingerPan.blocksExternalGesture(parentScrollGesture);
  }

  const gesture = Gesture.Simultaneous(pan, pinch, twoFingerPan);

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
      extendPositiveCanvas,
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
      extendPositiveCanvas,
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
          <MapGesturesContext.Provider
            value={{ pan, pinch, twoFingerPan, isPanning, multiTouchActive, touchSequence }}
          >
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
