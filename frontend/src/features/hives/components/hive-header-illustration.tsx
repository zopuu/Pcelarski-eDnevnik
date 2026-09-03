import {
  View,
} from 'react-native';

import {
  Image,
} from 'expo-image';

import {
  colors,
} from '@/shared/theme/colors';

type HiveHeaderIllustrationProps = {
  colorHex:
    | string
    | null;
};

const ILLUSTRATION_SIZE = 128;
const ILLUSTRATION_HEIGHT = 116;

export function HiveHeaderIllustration({
  colorHex,
}: HiveHeaderIllustrationProps) {
  return (
    <View
      accessible
      accessibilityLabel={
        colorHex
          ? `Košnica boje ${colorHex}`
          : 'Košnica bez odabrane boje'
      }
      className="items-center justify-center"
      style={{
        width: ILLUSTRATION_SIZE,
        height: ILLUSTRATION_HEIGHT,
      }}
    >
      <Image
        source={
          require(
            '../../../../assets/images/hive_background.png',
          )
        }
        contentFit="contain"
        tintColor={
          colorHex ??
          colors.surfaceWarm
        }
        style={{
          position: 'absolute',
          width: ILLUSTRATION_SIZE,
          height: ILLUSTRATION_SIZE,
          transform: [
            {
              translateY: -6,
            },
          ],
        }}
      />

      <Image
        source={
          require(
            '../../../../assets/images/hive.png',
          )
        }
        contentFit="contain"
        style={{
          width: ILLUSTRATION_SIZE,
          height: ILLUSTRATION_SIZE,
          transform: [
            {
              translateY: -8,
            },
          ],
        }}
      />
    </View>
  );
}
