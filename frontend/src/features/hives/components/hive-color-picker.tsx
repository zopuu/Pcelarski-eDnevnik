import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  useState,
} from 'react';

type HiveColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

type ColorOption = {
  name: string;
  hex: string;
};

const basicColors: ColorOption[] = [
  {
    name: 'Crvena',
    hex: '#DC2626',
  },
  {
    name: 'Zelena',
    hex: '#16A34A',
  },
  {
    name: 'Plava',
    hex: '#2563EB',
  },
  {
    name: 'Žuta',
    hex: '#FACC15',
  },
  {
    name: 'Narandžasta',
    hex: '#F97316',
  },
  {
    name: 'Bela',
    hex: '#FFFFFF',
  },
];

const colorVariants: ColorOption[] = [
  // Red
  {
    name: 'Svetlo crvena',
    hex: '#FCA5A5',
  },
  {
    name: 'Crvena',
    hex: '#EF4444',
  },
  {
    name: 'Tamno crvena',
    hex: '#B91C1C',
  },

  // Orange
  {
    name: 'Svetlo narandžasta',
    hex: '#FDBA74',
  },
  {
    name: 'Narandžasta',
    hex: '#F97316',
  },
  {
    name: 'Tamno narandžasta',
    hex: '#C2410C',
  },

  // Yellow
  {
    name: 'Svetlo žuta',
    hex: '#FEF08A',
  },
  {
    name: 'Žuta',
    hex: '#FACC15',
  },
  {
    name: 'Tamno žuta',
    hex: '#CA8A04',
  },

  // Green
  {
    name: 'Svetlo zelena',
    hex: '#86EFAC',
  },
  {
    name: 'Zelena',
    hex: '#22C55E',
  },
  {
    name: 'Tamno zelena',
    hex: '#15803D',
  },

  // Blue
  {
    name: 'Svetlo plava',
    hex: '#93C5FD',
  },
  {
    name: 'Plava',
    hex: '#3B82F6',
  },
  {
    name: 'Tamno plava',
    hex: '#1D4ED8',
  },

  // Neutral
  {
    name: 'Bela',
    hex: '#FFFFFF',
  },
  {
    name: 'Svetlo siva',
    hex: '#D1D5DB',
  },
  {
    name: 'Siva',
    hex: '#6B7280',
  },

  // Other useful hive colors
  {
    name: 'Svetlo braon',
    hex: '#D6A56C',
  },
  {
    name: 'Braon',
    hex: '#92400E',
  },
  {
    name: 'Tamno braon',
    hex: '#78350F',
  },
];

export function HiveColorPicker({
  value,
  onChange,
  error,
}: HiveColorPickerProps) {
  const [
    pickerVisible,
    setPickerVisible,
  ] = useState(false);

  return (
    <>
      <View className="mb-4">
        <Text
          className="
            mb-2
            text-sm
            font-semibold
            text-foreground
          "
        >
          Boja
        </Text>

        <View
          className="
            flex-row
            flex-wrap
            gap-3
          "
        >
          {basicColors.map(
            (color) => (
              <ColorButton
                key={color.hex}
                color={color.hex}
                selected={
                  value ===
                  color.hex
                }
                onPress={() => {
                  onChange(
                    value ===
                      color.hex
                      ? ''
                      : color.hex,
                  );
                }}
              />
            ),
          )}

          <Pressable
            onPress={() => {
              setPickerVisible(
                true,
              );
            }}
            className={`
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              border-2
              bg-surface
              ${
                value &&
                !basicColors.some(
                  (color) =>
                    color.hex ===
                    value,
                )
                  ? 'border-primary'
                  : 'border-border'
              }
            `}
          >
            {value &&
            !basicColors.some(
              (color) =>
                color.hex === value,
            ) ? (
              <View
                style={{
                  backgroundColor:
                    value,
                }}
                className="
                  h-8
                  w-8
                  rounded-full
                  border
                  border-border
                "
              />
            ) : (
              <Text
                className="
                  text-2xl
                  font-semibold
                  text-foreground
                "
              >
                +
              </Text>
            )}
          </Pressable>
        </View>

        {value ? (
          <View
            className="
              mt-3
              flex-row
              items-center
            "
          >
            <View
              style={{
                backgroundColor:
                  value,
              }}
              className="
                mr-2
                h-5
                w-5
                rounded-full
                border
                border-border
              "
            />

            <Text
              className="
                text-sm
                text-muted
              "
            >
              Izabrana boja
            </Text>
          </View>
        ) : null}

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

      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setPickerVisible(
            false,
          );
        }}
      >
        <Pressable
          className="
            flex-1
            justify-end
            bg-black/40
          "
          onPress={() => {
            setPickerVisible(
              false,
            );
          }}
        >
          <Pressable
            onPress={(
              event,
            ) => {
              event.stopPropagation();
            }}
            className="
              max-h-[70%]
              rounded-t-3xl
              bg-background
              px-5
              pb-8
              pt-5
            "
          >
            <View
              className="
                mb-5
                flex-row
                items-center
                justify-between
              "
            >
              <View>
                <Text
                  className="
                    text-xl
                    font-bold
                    text-foreground
                  "
                >
                  Izaberite boju
                </Text>

                <Text
                  className="
                    mt-1
                    text-sm
                    text-muted
                  "
                >
                  Odaberite željenu
                  nijansu košnice.
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  setPickerVisible(
                    false,
                  );
                }}
                className="
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-surface
                "
              >
                <Text
                  className="
                    text-xl
                    text-foreground
                  "
                >
                  ×
                </Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              <View
                className="
                  flex-row
                  flex-wrap
                  gap-4
                "
              >
                {colorVariants.map(
                  (color) => (
                    <ColorButton
                      key={
                        color.hex
                      }
                      color={
                        color.hex
                      }
                      selected={
                        value ===
                        color.hex
                      }
                      onPress={() => {
                        onChange(
                          color.hex,
                        );

                        setPickerVisible(
                          false,
                        );
                      }}
                      large
                    />
                  ),
                )}
              </View>

              {value && (
                <Pressable
                  onPress={() => {
                    onChange('');

                    setPickerVisible(
                      false,
                    );
                  }}
                  className="
                    mt-6
                    items-center
                    rounded-2xl
                    border
                    border-border
                    bg-surface
                    px-4
                    py-4
                  "
                >
                  <Text
                    className="
                      font-semibold
                      text-foreground
                    "
                  >
                    Ukloni boju
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

type ColorButtonProps = {
  color: string;
  selected: boolean;
  onPress: () => void;
  large?: boolean;
};

function ColorButton({
  color,
  selected,
  onPress,
  large = false,
}: ColorButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        `Izaberi boju ${color}`
      }
      onPress={onPress}
      className={`
        items-center
        justify-center
        rounded-full
        border-2
        ${
          large
            ? 'h-16 w-16'
            : 'h-12 w-12'
        }
        ${
          selected
            ? 'border-primary'
            : 'border-border'
        }
      `}
    >
      <View
        style={{
          backgroundColor:
            color,
        }}
        className={`
          rounded-full
          ${
            large
              ? 'h-12 w-12'
              : 'h-9 w-9'
          }
        `}
      />

      {selected && (
        <View
          className="
            absolute
            bottom-0
            right-0
            h-5
            w-5
            items-center
            justify-center
            rounded-full
            bg-primary
          "
        >
          <Text
            className="
              text-xs
              font-bold
              text-background
            "
          >
            ✓
          </Text>
        </View>
      )}
    </Pressable>
  );
}