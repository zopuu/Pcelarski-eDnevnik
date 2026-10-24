import { Text, View } from 'react-native';

import { ColorHexagon } from '@/shared/components/color-hexagon/color-hexagon';

type QueenMarkingColorSwatchProps = {
  colorHex: string | null;
};

export function QueenMarkingColorSwatch({ colorHex }: QueenMarkingColorSwatchProps) {
  if (!colorHex) {
    return <Text className="text-sm font-semibold text-foreground">—</Text>;
  }

  return (
    <View
      className="
        h-9
        w-10
        items-center
        justify-center
      "
    >
      <ColorHexagon colorHex={colorHex} accessibilityLabel={`Boja oznake matice ${colorHex}`} />
    </View>
  );
}
