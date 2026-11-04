import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { colors } from '@/shared/theme/colors';
import type { Alignment } from '../geometry/magnetic-alignment';
import type { MapCameraValues } from './map-viewport';

export function AlignmentGuides({
  alignment,
  camera,
}: {
  alignment: SharedValue<Alignment | null>;
  camera: MapCameraValues;
}) {
  const horizontal = useAnimatedStyle(() => ({
    opacity: alignment.value?.axis === 'y' ? 0.55 : 0,
    top:
      alignment.value?.axis === 'y'
        ? (alignment.value.coordinate - camera.y.value) * camera.zoom.value
        : 0,
  }));
  const vertical = useAnimatedStyle(() => ({
    opacity: alignment.value?.axis === 'x' ? 0.55 : 0,
    left:
      alignment.value?.axis === 'x'
        ? (alignment.value.coordinate - camera.x.value) * camera.zoom.value
        : 0,
  }));

  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.horizontal, horizontal]} />
      <Animated.View pointerEvents="none" style={[styles.vertical, vertical]} />
    </>
  );
}

const styles = StyleSheet.create({
  horizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.primary,
  },
  vertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.primary,
  },
});
