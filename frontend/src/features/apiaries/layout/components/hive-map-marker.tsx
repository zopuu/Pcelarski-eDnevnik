import { memo, useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { HiveHeaderIllustration } from '@/features/hives/components/hive-header-illustration';
import { colors } from '@/shared/theme/colors';

import type { ApiaryLayoutHive } from '../../types/apiary-layout';
import type { HiveFootprint } from '../geometry/hive-footprints';
import type { HiveDragHandlers } from '../hooks/use-hive-layout-drag';
import { useMapViewportGestures } from './map-viewport';

export type HiveMapMarkerProps = {
  hive: ApiaryLayoutHive;
  footprint: HiveFootprint;
  /** Replaces the label within the illustrated hive's front face. */
  faceContent?: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  onPressHive?: (hiveId: string) => void;
  onLongPressHive?: (hiveId: string) => void;
  dragHandlers?: HiveDragHandlers;
  onArtworkDisplay?: () => void;
};

export const HiveMapMarker = memo(function HiveMapMarker({
  hive,
  footprint,
  faceContent,
  onPress,
  onLongPress,
  onPressHive,
  onLongPressHive,
  dragHandlers,
  onArtworkDisplay,
}: HiveMapMarkerProps) {
  const viewportGestures = useMapViewportGestures();
  const gesture = useMemo(() => {
    if (!onPress && !onLongPress && !onPressHive && !onLongPressHive && !dragHandlers) return null;

    const tap = Gesture.Tap()
      .maxDistance(4)
      .maxDuration(250)
      .runOnJS(true)
      .onEnd((_event, success) => {
        if (success) {
          onPress?.();
          onPressHive?.(hive.id);
        }
      });

    if (viewportGestures) {
      tap.requireExternalGestureToFail(viewportGestures.pan, viewportGestures.pinch);
    }
    if (dragHandlers) {
      const drag = Gesture.Pan()
        .activateAfterLongPress(500)
        .minDistance(0)
        .maxPointers(1)
        .averageTouches(true)
        .onStart((event) => dragHandlers.start(hive, 'map', event.absoluteX, event.absoluteY))
        .onUpdate((event) => dragHandlers.update(event.absoluteX, event.absoluteY))
        .onEnd((event, success) => dragHandlers.end(event.absoluteX, event.absoluteY, success))
        .onFinalize(() => dragHandlers.finalize());
      if (viewportGestures) {
        drag.simultaneousWithExternalGesture(viewportGestures.pan, viewportGestures.pinch);
      }
      return Gesture.Simultaneous(drag, tap);
    }
    if (!onLongPress && !onLongPressHive) return tap;

    const longPress = Gesture.LongPress()
      .numberOfPointers(1)
      .minDuration(500)
      .maxDistance(4)
      .runOnJS(true)
      .onStart(() => {
        onLongPress?.();
        onLongPressHive?.(hive.id);
      });

    // A long press wins over a tap; movement activates the viewport pan instead.
    return Gesture.Exclusive(longPress, tap);
  }, [onPress, onLongPress, onPressHive, onLongPressHive, viewportGestures, dragHandlers, hive]);

  const illustrationSize = Math.min(footprint.width - 4, footprint.height - 4);
  const illustrationTop = (footprint.height - illustrationSize) / 2 + illustrationSize * 0.125;
  const faceWidth = illustrationSize * 0.78;

  const marker = (
    <View
      collapsable={false}
      accessible
      accessibilityRole={gesture ? 'button' : 'image'}
      accessibilityLabel={`Košnica ${hive.label}`}
      accessibilityActions={
        gesture
          ? [
              ...(onPress || onPressHive ? [{ name: 'activate' as const }] : []),
              ...(onLongPress || onLongPressHive ? [{ name: 'longpress' as const }] : []),
            ]
          : undefined
      }
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'activate') {
          onPress?.();
          onPressHive?.(hive.id);
        }
        if (event.nativeEvent.actionName === 'longpress') {
          onLongPress?.();
          onLongPressHive?.(hive.id);
        }
      }}
      style={[styles.marker, { width: footprint.width, height: footprint.height }]}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: illustrationTop,
          left: (footprint.width - illustrationSize) / 2,
        }}
      >
        <HiveHeaderIllustration
          colorHex={hive.colorHex}
          size={illustrationSize}
          accessible={false}
          onDisplay={onArtworkDisplay}
        />
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.frontFace,
          {
            top: illustrationTop + illustrationSize * 0.39,
            left: (footprint.width - faceWidth) / 2,
            width: faceWidth,
            height: illustrationSize * 0.2,
          },
        ]}
      >
        {faceContent === undefined ? (
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.label}>
            {hive.label}
          </Text>
        ) : (
          faceContent
        )}
      </View>
    </View>
  );

  return gesture ? <GestureDetector gesture={gesture}>{marker}</GestureDetector> : marker;
});

const styles = StyleSheet.create({
  marker: {
    overflow: 'hidden',
    alignItems: 'center',
  },
  frontFace: {
    position: 'absolute',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    maxWidth: '100%',
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: colors.surface,
    paddingHorizontal: 2,
    color: colors.foreground,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});
