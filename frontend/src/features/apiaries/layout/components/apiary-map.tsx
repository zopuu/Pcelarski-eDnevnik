import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { GestureType } from 'react-native-gesture-handler';

import type { ApiaryLayoutHive } from '../../types/apiary-layout';
import { partitionApiaryLayoutHives } from '../apiary-layout-selectors';
import type { MapContentBounds } from '../geometry/coordinates';
import { resolveHiveFootprint, type HiveFootprint } from '../geometry/hive-footprints';
import { HiveMapMarker } from './hive-map-marker';
import { MapViewport } from './map-viewport';

type PositionedHive = {
  hive: ApiaryLayoutHive & { x: number; y: number };
  footprint: HiveFootprint;
};

export type ApiaryMapProps = {
  hives: readonly ApiaryLayoutHive[];
  /** The host owns the viewport height and any surrounding visual treatment. */
  style?: StyleProp<ViewStyle>;
  parentScrollGesture?: GestureType;
  onHivePress?: (hiveId: string) => void;
  onHiveLongPress?: (hiveId: string) => void;
  /** Custom content stays within the existing hive artwork's front face. */
  renderFaceContent?: (hive: ApiaryLayoutHive) => ReactNode;
};

export function ApiaryMap({
  hives,
  style,
  parentScrollGesture,
  onHivePress,
  onHiveLongPress,
  renderFaceContent,
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
      parentScrollGesture={parentScrollGesture}
      style={style}
    >
      {positionedHives.map(({ hive, footprint }) => (
        <View
          key={hive.id}
          pointerEvents="box-none"
          style={[
            styles.positioned,
            { left: hive.x, top: hive.y, width: footprint.width, height: footprint.height },
          ]}
        >
          <HiveMapMarker
            hive={hive}
            footprint={footprint}
            faceContent={renderFaceContent?.(hive)}
            onPress={onHivePress ? () => onHivePress(hive.id) : undefined}
            onLongPress={onHiveLongPress ? () => onHiveLongPress(hive.id) : undefined}
          />
        </View>
      ))}
    </MapViewport>
  );
}

const styles = StyleSheet.create({
  positioned: {
    position: 'absolute',
  },
});
