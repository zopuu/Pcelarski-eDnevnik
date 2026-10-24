import { Pressable, Text, View } from 'react-native';

import { ColorHexagon } from '@/shared/components/color-hexagon/color-hexagon';
import { colors } from '@/shared/theme/colors';

type QueenMarkingColorPickerProps = {
  value: string;

  onChange: (value: string) => void;

  error?: string;
};

const markingColors = [
  {
    label: 'Plava',
    value: '#2563EB',
  },
  {
    label: 'Zelena',
    value: '#16A34A',
  },
  {
    label: 'Crvena',
    value: '#DC2626',
  },
  {
    label: 'Žuta',
    value: '#FACC15',
  },
  {
    label: 'Bela',
    value: '#FFFFFF',
  },
] as const;

export function QueenMarkingColorPicker({ value, onChange, error }: QueenMarkingColorPickerProps) {
  return (
    <View
      className="
        mb-5
      "
    >
      <Text
        className="
          mb-3
          text-sm
          font-semibold
          text-foreground
        "
      >
        Boja oznake
      </Text>

      <View
        className="
          flex-row
          justify-between
        "
      >
        {markingColors.map((color) => {
          const selected = value.toUpperCase() === color.value;

          return (
            <Pressable
              key={color.value}
              accessibilityLabel={color.label}
              onPress={() => {
                onChange(selected ? '' : color.value);
              }}
              className="
                  items-center
                "
              style={{
                width: '18%',
              }}
            >
              <ColorHexagon
                colorHex={color.value}
                size={48}
                borderColor={selected ? colors.primary : colors.border}
              />

              <Text
                className="
                    mt-2
                    text-center
                    text-xs
                    text-muted
                  "
              >
                {color.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error && (
        <Text
          className="
            mt-2
            text-sm
            text-error
          "
        >
          {error}
        </Text>
      )}
    </View>
  );
}
