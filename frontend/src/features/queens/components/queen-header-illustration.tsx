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

  size?: number;
};

const ILLUSTRATION_WIDTH = 134;
const ILLUSTRATION_HEIGHT = 134;
const MARKING_SIZE = 17;
const MARKING_LEFT = 59;
const MARKING_TOP = 29;

export function QueenHeaderIllustration({
  markingColorHex,
  size = ILLUSTRATION_WIDTH,
}: QueenHeaderIllustrationProps) {
  const scale =
    size / ILLUSTRATION_WIDTH;

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
        width: size,
        height:
          ILLUSTRATION_HEIGHT *
          scale,
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
          width: size,
          height:
            ILLUSTRATION_HEIGHT *
            scale,
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

            left:
              MARKING_LEFT *
              scale,

            top:
              MARKING_TOP *
              scale,

            width:
              MARKING_SIZE *
              scale,

            height:
              MARKING_SIZE *
              scale,
          }}
        />
      )}
    </View>
  );
}
