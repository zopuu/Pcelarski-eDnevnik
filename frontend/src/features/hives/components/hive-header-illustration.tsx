import { useRef } from 'react';
import { View } from 'react-native';

import { Image } from 'expo-image';

import { colors } from '@/shared/theme/colors';

type HiveHeaderIllustrationProps = {
  colorHex: string | null;

  size?: number;

  accessible?: boolean;
  onDisplay?: () => void;
};

const ILLUSTRATION_SIZE = 128;
const ILLUSTRATION_HEIGHT = 116;

export function HiveHeaderIllustration({
  colorHex,
  size = ILLUSTRATION_SIZE,
  accessible = true,
  onDisplay,
}: HiveHeaderIllustrationProps) {
  const scale = size / ILLUSTRATION_SIZE;
  const displayed = useRef({ background: false, hive: false });
  const reportDisplay = () => {
    if (displayed.current.background && displayed.current.hive) onDisplay?.();
  };
  const markBackgroundDisplayed = onDisplay
    ? () => {
        displayed.current.background = true;
        reportDisplay();
      }
    : undefined;
  const markHiveDisplayed = onDisplay
    ? () => {
        displayed.current.hive = true;
        reportDisplay();
      }
    : undefined;

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
        onDisplay={markBackgroundDisplayed}
        onError={markBackgroundDisplayed}
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
        onDisplay={markHiveDisplayed}
        onError={markHiveDisplayed}
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
