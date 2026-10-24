import Svg, { Polygon } from 'react-native-svg';

import { colors } from '@/shared/theme/colors';

type ColorHexagonProps = {
  colorHex: string;
  size?: number;
  borderColor?: string;
  accessibilityLabel?: string;
};

export function ColorHexagon({
  colorHex,
  size = 40,
  borderColor = colors.primary,
  accessibilityLabel,
}: ColorHexagonProps) {
  return (
    <Svg
      accessible={accessibilityLabel ? true : undefined}
      accessibilityLabel={accessibilityLabel}
      width={size}
      height={size * 0.9}
      viewBox="0 0 40 36"
    >
      <Polygon points="10,1 30,1 39,18 30,35 10,35 1,18" fill={borderColor} />

      <Polygon points="11,5 29,5 35,18 29,31 11,31 5,18" fill={colorHex} />
    </Svg>
  );
}
