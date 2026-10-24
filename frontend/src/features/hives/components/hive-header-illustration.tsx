import { View } from 'react-native';

import { Image } from 'expo-image';

import { colors } from '@/shared/theme/colors';

type HiveHeaderIllustrationProps = {
  colorHex: string | null;

  size?: number;

  accessible?: boolean;
};

const ILLUSTRATION_SIZE = 128;
const ILLUSTRATION_HEIGHT = 116;

export function HiveHeaderIllustration({
  colorHex,
  size = ILLUSTRATION_SIZE,
  accessible = true,
}: HiveHeaderIllustrationProps) {
  const scale = size / ILLUSTRATION_SIZE;

  return (
    <View
      accessible={accessible}
      accessibilityLabel={
        accessible && colorHex
          ? `Košnica boje ${colorHex}`
          : accessible
            ? 'Košnica bez odabrane boje'
            : undefined
      }
      className="items-center justify-center"
      style={{
        width: size,
        height: ILLUSTRATION_HEIGHT * scale,
      }}
    >
      <Image
        source={require('../../../../assets/images/hive_background.png')}
        contentFit="contain"
        tintColor={colorHex ?? colors.surfaceWarm}
        style={{
          position: 'absolute',
          width: size,
          height: size,
          transform: [
            {
              translateY: -6 * scale,
            },
          ],
        }}
      />

      <Image
        source={require('../../../../assets/images/hive.png')}
        contentFit="contain"
        style={{
          width: size,
          height: size,
          transform: [
            {
              translateY: -8 * scale,
            },
          ],
        }}
      />
    </View>
  );
}
