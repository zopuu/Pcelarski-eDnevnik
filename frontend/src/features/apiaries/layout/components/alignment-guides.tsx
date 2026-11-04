import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { colors } from '@/shared/theme/colors';
import { MINIMUM_HIVE_SPACING } from '../geometry/hive-footprints';
import type { MagneticAlignments } from '../geometry/magnetic-alignment';
import type { MapCameraValues } from './map-viewport';

export function AlignmentGuides({
  alignment,
  camera,
}: {
  alignment: SharedValue<MagneticAlignments | null>;
  camera: MapCameraValues;
}) {
  const horizontal = useAnimatedStyle(() => ({
    opacity: alignment.value?.edge?.axis === 'y' ? 0.55 : 0,
    top:
      alignment.value?.edge?.axis === 'y'
        ? (alignment.value.edge.coordinate - camera.y.value) * camera.zoom.value
        : 0,
  }));
  const vertical = useAnimatedStyle(() => ({
    opacity: alignment.value?.edge?.axis === 'x' ? 0.55 : 0,
    left:
      alignment.value?.edge?.axis === 'x'
        ? (alignment.value.edge.coordinate - camera.x.value) * camera.zoom.value
        : 0,
  }));
  const horizontalSpacing = useAnimatedStyle(() => {
    const spacing = alignment.value?.spacing;
    return {
      opacity: spacing?.axis === 'x' ? 1 : 0,
      left: spacing ? (spacing.gapStart - camera.x.value) * camera.zoom.value : 0,
      top: spacing ? (spacing.crossCoordinate - camera.y.value) * camera.zoom.value - 7 : 0,
      width: MINIMUM_HIVE_SPACING * camera.zoom.value,
    };
  });
  const verticalSpacing = useAnimatedStyle(() => {
    const spacing = alignment.value?.spacing;
    return {
      opacity: spacing?.axis === 'y' ? 1 : 0,
      left: spacing ? (spacing.crossCoordinate - camera.x.value) * camera.zoom.value - 7 : 0,
      top: spacing ? (spacing.gapStart - camera.y.value) * camera.zoom.value : 0,
      height: MINIMUM_HIVE_SPACING * camera.zoom.value,
    };
  });

  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.horizontal, horizontal]} />
      <Animated.View pointerEvents="none" style={[styles.vertical, vertical]} />
      <Animated.View pointerEvents="none" style={[styles.horizontalSpacing, horizontalSpacing]}>
        <View style={styles.horizontalSpacingBar} />
        <View style={styles.horizontalStartCap} />
        <View style={styles.horizontalEndCap} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.verticalSpacing, verticalSpacing]}>
        <View style={styles.verticalSpacingBar} />
        <View style={styles.verticalStartCap} />
        <View style={styles.verticalEndCap} />
      </Animated.View>
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
  horizontalSpacing: {
    position: 'absolute',
    height: 14,
  },
  horizontalSpacingBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 6,
    height: 2,
    backgroundColor: colors.primaryDark,
  },
  horizontalStartCap: {
    position: 'absolute',
    left: 0,
    top: 2,
    width: 2,
    height: 10,
    backgroundColor: colors.primaryDark,
  },
  horizontalEndCap: {
    position: 'absolute',
    right: 0,
    top: 2,
    width: 2,
    height: 10,
    backgroundColor: colors.primaryDark,
  },
  verticalSpacing: {
    position: 'absolute',
    width: 14,
  },
  verticalSpacingBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 6,
    width: 2,
    backgroundColor: colors.primaryDark,
  },
  verticalStartCap: {
    position: 'absolute',
    left: 2,
    top: 0,
    width: 10,
    height: 2,
    backgroundColor: colors.primaryDark,
  },
  verticalEndCap: {
    position: 'absolute',
    left: 2,
    bottom: 0,
    width: 10,
    height: 2,
    backgroundColor: colors.primaryDark,
  },
});
