import {
  Pressable,
  Text,
  View,
} from 'react-native';

type QueenMarkingColorPickerProps = {
  value: string;

  onChange: (
    value: string,
  ) => void;

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

export function QueenMarkingColorPicker({
  value,
  onChange,
  error,
}: QueenMarkingColorPickerProps) {
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
        {markingColors.map(
          (color) => {
            const selected =
              value.toUpperCase() ===
              color.value;

            return (
              <Pressable
                key={
                  color.value
                }
                accessibilityLabel={
                  color.label
                }
                onPress={() => {
                  onChange(
                    selected
                      ? ''
                      : color.value,
                  );
                }}
                className="
                  items-center
                "
                style={{
                  width: '18%',
                }}
              >
                <View
                  className={`
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    ${selected
                      ? 'border-primary'
                      : 'border-border'
                    }
                  `}
                >
                  <View
                    className="
                      h-9
                      w-9
                      rounded-full
                      border
                      border-border
                    "
                    style={{
                      backgroundColor:
                        color.value,
                    }}
                  />
                </View>

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
          },
        )}
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