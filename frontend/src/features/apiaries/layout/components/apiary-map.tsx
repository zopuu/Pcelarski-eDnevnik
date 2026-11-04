import { memo, useMemo, useRef, type ReactNode, type Ref } from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { GestureType } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import type { ApiaryLayoutHive } from '../../types/apiary-layout';
import { partitionApiaryLayoutHives } from '../apiary-layout-selectors';
import type { MapContentBounds } from '../geometry/coordinates';
import { resolveHiveFootprint, type HiveFootprint } from '../geometry/hive-footprints';
import { HiveMapMarker } from './hive-map-marker';
import { MapViewport, type MapCameraValues } from './map-viewport';
import type { HiveDragHandlers } from '../hooks/use-hive-layout-drag';

type PositionedHive = {
  hive: ApiaryLayoutHive & { x: number; y: number };
  footprint: HiveFootprint;
};

export type ApiaryMapProps = {
  hives: readonly ApiaryLayoutHive[];
  /** The host owns the viewport height and any surrounding visual treatment. */
  style?: StyleProp<ViewStyle>;
  overlay?: ReactNode;
  extendPositiveCanvas?: boolean;
  parentScrollGesture?: GestureType;
  onHivePress?: (hiveId: string) => void;
  onHiveLongPress?: (hiveId: string) => void;
  /** Custom content stays within the existing hive artwork's front face. */
  renderFaceContent?: (hive: ApiaryLayoutHive) => ReactNode;
  cameraValues?: MapCameraValues;
  interactionLocked?: SharedValue<boolean>;
  viewportRef?: Ref<View>;
  dragHandlers?: HiveDragHandlers;
  activeDragHiveId?: SharedValue<string | null>;
  onMarkerReady?: (hiveId: string, x: number, y: number) => void;
};

export const ApiaryMap = memo(function ApiaryMap({
  hives,
  style,
  overlay,
  extendPositiveCanvas,
  parentScrollGesture,
  onHivePress,
  onHiveLongPress,
  renderFaceContent,
  cameraValues,
  interactionLocked,
  viewportRef,
  dragHandlers,
  activeDragHiveId,
  onMarkerReady,
}: ApiaryMapProps) {
  const { positionedHives, contentBounds } = useMemo(() => {
    const { placed } = partitionApiaryLayoutHives(hives);
    if (placed.length === 0) {
      return { positionedHives: [] as PositionedHive[], contentBounds: undefined };
    }

    let right = 0;
    let bottom = 0;
    const positionedHives = placed.map((hive) => {
      const footprint = resolveHiveFootprint(hive.hiveType);
      right = Math.max(right, hive.x + footprint.width);
      bottom = Math.max(bottom, hive.y + footprint.height);
      return { hive, footprint };
    });
    const contentBounds: MapContentBounds = { x: 0, y: 0, width: right, height: bottom };
    return { positionedHives, contentBounds };
  }, [hives]);

  return (
    <MapViewport
      contentBounds={contentBounds}
      overlay={overlay}
      extendPositiveCanvas={extendPositiveCanvas}
      parentScrollGesture={parentScrollGesture}
      style={style}
      cameraValues={cameraValues}
      interactionLocked={interactionLocked}
      viewportRef={viewportRef}
    >
      {positionedHives.map(({ hive, footprint }) => (
        <PositionedMarker
          key={hive.id}
          hive={hive}
          footprint={footprint}
          faceContent={renderFaceContent?.(hive)}
          onHivePress={onHivePress}
          onHiveLongPress={onHiveLongPress}
          dragHandlers={dragHandlers}
          interactionLocked={interactionLocked}
          activeDragHiveId={activeDragHiveId}
          onMarkerReady={onMarkerReady}
        />
      ))}
    </MapViewport>
  );
});

function PositionedMarker({
  hive,
  footprint,
  faceContent,
  onHivePress,
  onHiveLongPress,
  dragHandlers,
  interactionLocked,
  activeDragHiveId,
  onMarkerReady,
}: {
  hive: ApiaryLayoutHive & { x: number; y: number };
  footprint: HiveFootprint;
  faceContent?: ReactNode;
  onHivePress?: (id: string) => void;
  onHiveLongPress?: (id: string) => void;
  dragHandlers?: HiveDragHandlers;
  interactionLocked?: SharedValue<boolean>;
  activeDragHiveId?: SharedValue<string | null>;
  onMarkerReady?: (hiveId: string, x: number, y: number) => void;
}) {
  const artworkDisplayed = useRef(false);
  const laidOutAt = useRef<{ x: number; y: number } | null>(null);
  const reportReady = () => {
    if (
      artworkDisplayed.current &&
      laidOutAt.current &&
      Math.abs(laidOutAt.current.x - hive.x) < 0.5 &&
      Math.abs(laidOutAt.current.y - hive.y) < 0.5
    ) {
      onMarkerReady?.(hive.id, hive.x, hive.y);
    }
  };
  const handleLayout = (event: LayoutChangeEvent) => {
    laidOutAt.current = event.nativeEvent.layout;
    reportReady();
  };
  const dragSourceStyle = useAnimatedStyle(() => ({
    opacity: activeDragHiveId?.value === hive.id ? 0 : 1,
  }));
  return (
    <Animated.View
      pointerEvents="box-none"
      onLayout={onMarkerReady ? handleLayout : undefined}
      style={[
        styles.positioned,
        { left: hive.x, top: hive.y, width: footprint.width, height: footprint.height },
        dragSourceStyle,
      ]}
    >
      <HiveMapMarker
        hive={hive}
        footprint={footprint}
        faceContent={faceContent}
        onPressHive={onHivePress}
        onLongPressHive={onHiveLongPress}
        dragHandlers={dragHandlers}
        interactionLocked={interactionLocked}
        onArtworkDisplay={
          onMarkerReady
            ? () => {
                artworkDisplayed.current = true;
                reportReady();
              }
            : undefined
        }
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  positioned: {
    position: 'absolute',
  },
});
