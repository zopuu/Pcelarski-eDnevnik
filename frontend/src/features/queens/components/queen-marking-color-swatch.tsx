import {
  Text,
  View,
} from 'react-native';

import Svg, {
  Polygon,
} from 'react-native-svg';

import {
  colors,
} from '@/shared/theme/colors';

type QueenMarkingColorSwatchProps = {
  colorHex:
    | string
    | null;
};

export function QueenMarkingColorSwatch({
  colorHex,
}: QueenMarkingColorSwatchProps) {
  if (!colorHex) {
    return (
      <Text className="text-sm font-semibold text-foreground">
        —
      </Text>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={`Boja oznake matice ${colorHex}`}
      className="
        h-9
        w-10
        items-center
        justify-center
      "
    >
      <Svg
        width={40}
        height={36}
        viewBox="0 0 40 36"
      >
        <Polygon
          points="10,1 30,1 39,18 30,35 10,35 1,18"
          fill={colors.primary}
        />

        <Polygon
          points="11,5 29,5 35,18 29,31 11,31 5,18"
          fill={colorHex}
        />
      </Svg>
    </View>
  );
}
