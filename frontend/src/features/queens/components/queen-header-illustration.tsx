import {
  View,
} from 'react-native';

import {
  Image,
} from 'expo-image';

type QueenHeaderIllustrationProps = {
  markingColorHex:
    | string
    | null;
};

const ILLUSTRATION_WIDTH = 134;
const ILLUSTRATION_HEIGHT = 134;
const MARKING_SIZE = 17;
const MARKING_LEFT = 59;
const MARKING_TOP = 29;

export function QueenHeaderIllustration({
  markingColorHex,
}: QueenHeaderIllustrationProps) {
  return (
    <View
      accessible
      accessibilityLabel={
        markingColorHex
          ? `Matica sa oznakom boje ${markingColorHex}`
          : 'Matica bez oznake boje'
      }
      className="items-center justify-center"
      style={{
        width: ILLUSTRATION_WIDTH,
        height: ILLUSTRATION_HEIGHT,
      }}
    >
      <Image
        source={
          require(
            '../../../../assets/images/bee_queen.png',
          )
        }
        contentFit="contain"
        style={{
          width: ILLUSTRATION_WIDTH,
          height: ILLUSTRATION_HEIGHT,
        }}
      />

      {markingColorHex && (
        <View
          className="
            absolute
            rounded-full
          "
          style={{
            backgroundColor:
              markingColorHex,

            left: MARKING_LEFT,

            top: MARKING_TOP,

            width: MARKING_SIZE,

            height: MARKING_SIZE,
          }}
        />
      )}
    </View>
  );
}
