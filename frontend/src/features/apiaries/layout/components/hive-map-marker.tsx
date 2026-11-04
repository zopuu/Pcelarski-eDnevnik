import { memo, useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, type SharedValue } from 'react-native-reanimated';

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
  interactionLocked?: SharedValue<boolean>;
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
  interactionLocked,
  onArtworkDisplay,
}: HiveMapMarkerProps) {
  const viewportGestures = useMapViewportGestures();
  const viewportPan = viewportGestures?.pan;
  const viewportPinch = viewportGestures?.pinch;
  const viewportTwoFingerPan = viewportGestures?.twoFingerPan;
  const viewportIsPanning = viewportGestures?.isPanning;
  const multiTouchActive = viewportGestures?.multiTouchActive;
  const touchSequence = viewportGestures?.touchSequence;
  const tapStartSequence = useSharedValue(0);
  const tapSawMultiTouch = useSharedValue(false);
  const dragStartSequence = useSharedValue(0);
  const dragStarted = useSharedValue(false);
  const gesture = useMemo(() => {
    if (!onPress && !onLongPress && !onPressHive && !onLongPressHive && !dragHandlers) return null;

    const tap = Gesture.Tap()
      .maxDistance(4)
      .maxDuration(250)
      .onBegin(() => {
        tapStartSequence.value = touchSequence?.value ?? 0;
        if (multiTouchActive?.value) tapSawMultiTouch.value = true;
      })
      .onTouchesDown((event) => {
        if (event.numberOfTouches > 1) tapSawMultiTouch.value = true;
      })
      .onEnd((_event, success) => {
        if (
          !success ||
          interactionLocked?.value ||
          tapSawMultiTouch.value ||
          multiTouchActive?.value ||
          tapStartSequence.value !== (touchSequence?.value ?? 0)
        )
          return;
        if (onPress) runOnJS(onPress)();
        if (onPressHive) runOnJS(onPressHive)(hive.id);
      })
      .onFinalize(() => {
        tapSawMultiTouch.value = false;
      });

    if (viewportPan && viewportPinch && viewportTwoFingerPan) {
      tap.requireExternalGestureToFail(viewportPan, viewportPinch, viewportTwoFingerPan);
    }
    if (dragHandlers) {
      // Movement must fail the pending drag before it can activate; the hold timer starts it.
      const drag = Gesture.Pan()
        .activateAfterLongPress(650)
        .minDistance(16)
        .failOffsetX([-4, 4])
        .failOffsetY([-4, 4])
        .maxPointers(1)
        .averageTouches(true)
        .onBegin(() => {
          dragStartSequence.value = touchSequence?.value ?? 0;
          dragStarted.value = false;
        })
        .onTouchesDown((event) => {
          if (event.numberOfTouches > 1 && dragStarted.value) {
            dragHandlers.finalize();
            dragStarted.value = false;
          }
        })
        .onStart((event) => {
          if (
            viewportIsPanning?.value ||
            multiTouchActive?.value ||
            dragStartSequence.value !== (touchSequence?.value ?? 0)
          )
            return;
          dragStarted.value = true;
          dragHandlers.start(hive, 'map', event.absoluteX, event.absoluteY);
        })
        .onUpdate((event) => {
          if (!dragStarted.value) return;
          if (multiTouchActive?.value || dragStartSequence.value !== (touchSequence?.value ?? 0)) {
            dragHandlers.finalize();
            dragStarted.value = false;
            return;
          }
          dragHandlers.update(event.absoluteX, event.absoluteY);
        })
        .onEnd((event, success) => {
          if (!dragStarted.value) return;
          dragHandlers.end(
            event.absoluteX,
            event.absoluteY,
            success &&
              !multiTouchActive?.value &&
              dragStartSequence.value === (touchSequence?.value ?? 0),
          );
        })
        .onFinalize(() => {
          if (dragStarted.value) dragHandlers.finalize();
          dragStarted.value = false;
        });
      if (viewportPan && viewportPinch && viewportTwoFingerPan) {
        drag.simultaneousWithExternalGesture(viewportPan, viewportPinch, viewportTwoFingerPan);
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
  }, [
    onPress,
    onLongPress,
    onPressHive,
    onLongPressHive,
    viewportPan,
    viewportPinch,
    viewportTwoFingerPan,
    viewportIsPanning,
    multiTouchActive,
    touchSequence,
    dragHandlers,
    interactionLocked,
    hive,
    tapStartSequence,
    tapSawMultiTouch,
    dragStartSequence,
    dragStarted,
  ]);

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
        if (interactionLocked?.value || multiTouchActive?.value) return;
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
