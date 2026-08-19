import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  router,
} from 'expo-router';

import {
  Controller,
  useForm,
} from 'react-hook-form';

import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

import {
  useCreateApiary,
} from '@/features/apiaries/hooks/use-create-apiary';

import {
  createApiarySchema,
} from '@/features/apiaries/schemas/create-apiary-schema';

import type {
  CreateApiaryFormValues,
} from '@/features/apiaries/schemas/create-apiary-schema';

import type {
  CreateApiaryRequest,
  HiveEntranceOrientation,
} from '@/features/apiaries/types/create-apiary';

import {
  colors,
} from '@/shared/theme/colors';

function optionalText(
  value: string,
): string | null {
  const trimmed =
    value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

function parseCoordinate(
  value: string,
): number {
  return Number(
    value
      .trim()
      .replace(',', '.'),
  );
}

function parseOptionalInteger(
  value: string,
): number | null {
  const trimmed =
    value.trim();

  return trimmed.length > 0
    ? Number(trimmed)
    : null;
}

const orientationOptions: {
  value: HiveEntranceOrientation;
  label: string;
}[] = [
    {
      value: 'north',
      label: 'Sever',
    },
    {
      value: 'northEast',
      label: 'Severoistok',
    },
    {
      value: 'east',
      label: 'Istok',
    },
    {
      value: 'southEast',
      label: 'Jugoistok',
    },
    {
      value: 'south',
      label: 'Jug',
    },
    {
      value: 'southWest',
      label: 'Jugozapad',
    },
    {
      value: 'west',
      label: 'Zapad',
    },
    {
      value: 'northWest',
      label: 'Severozapad',
    },
  ];

export function CreateApiaryScreen() {
  const createMutation =
    useCreateApiary();

  const {
    control,
    handleSubmit,
    formState: {
      errors,
    },
  } =
    useForm<CreateApiaryFormValues>({
      resolver:
        zodResolver(
          createApiarySchema,
        ),

      defaultValues: {
        name: '',
        identificationNumber: '',
        type: null,

        locationName: '',
        latitude: '',
        longitude: '',
        altitudeMeters: '',
        cadastralParcelNumber: '',
        description: '',

        orientation: null,
        stayNote: '',
      },
    });

  const onSubmit =
    async (
      values:
        CreateApiaryFormValues,
    ) => {
      const request:
        CreateApiaryRequest = {
        name:
          optionalText(
            values.name,
          ),

        identificationNumber:
          optionalText(
            values
              .identificationNumber,
          ),

        type:
          values.type,

        initialStay: {
          orientation:
            values.orientation,

          note:
            optionalText(
              values.stayNote,
            ),

          location: {
            name:
              optionalText(
                values
                  .locationName,
              ),

            latitude:
              parseCoordinate(
                values.latitude,
              ),

            longitude:
              parseCoordinate(
                values.longitude,
              ),

            altitudeMeters:
              parseOptionalInteger(
                values
                  .altitudeMeters,
              ),

            cadastralParcelNumber:
              optionalText(
                values
                  .cadastralParcelNumber,
              ),

            description:
              optionalText(
                values
                  .description,
              ),
          },
        },
      };

      try {
        await createMutation
          .mutateAsync(
            request,
          );

        router.replace('/');
      } catch {
        /*
         * Error is displayed below.
         */
      }
    };

  return (
    <View
      className="
      flex-1
      bg-background
    "
    >
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 48,
        }}
      >
        <Pressable
          onPress={() => {
            router.back();
          }}
          className="
            mb-5
            self-start
            py-2
          "
        >
          <Text
            className="
              text-base
              font-semibold
              text-primary
            "
          >
            ← Nazad
          </Text>
        </Pressable>

        <Text
          className="
            text-2xl
            font-bold
            text-foreground
          "
        >
          Novi pčelinjak
        </Text>

        <Text
          className="
            mt-1
            text-sm
            text-muted
          "
        >
          Unesite osnovne podatke
          i trenutnu lokaciju
          pčelinjaka.
        </Text>

        <Text
          className="
            mb-3
            mt-8
            text-lg
            font-bold
            text-foreground
          "
        >
          Podaci o pčelinjaku
        </Text>

        <Controller
          control={control}
          name="name"
          render={({
            field,
          }) => (
            <FormTextInput
              label="Naziv"
              value={
                field.value
              }
              onChangeText={
                field.onChange
              }
              placeholder="npr. Glavni pčelinjak"
              error={
                errors.name
                  ?.message
              }
            />
          )}
        />

        <Controller
          control={control}
          name="identificationNumber"
          render={({
            field,
          }) => (
            <FormTextInput
              label="Identifikacioni broj"
              value={
                field.value
              }
              onChangeText={
                field.onChange
              }
              placeholder="RS123456789012"
              autoCapitalize="characters"
              error={
                errors
                  .identificationNumber
                  ?.message
              }
            />
          )}
        />

        <Controller
          control={control}
          name="type"
          render={({
            field,
          }) => (
            <View className="mb-4">
              <Text
                className="
                  mb-2
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                Tip pčelinjaka
              </Text>

              <View
                className="
                  flex-row
                  gap-2
                "
              >
                <Choice
                  label="Stacionarni"
                  selected={
                    field.value ===
                    'stationary'
                  }
                  onPress={() => {
                    field.onChange(
                      'stationary',
                    );
                  }}
                />

                <Choice
                  label="Seleći"
                  selected={
                    field.value ===
                    'migratory'
                  }
                  onPress={() => {
                    field.onChange(
                      'migratory',
                    );
                  }}
                />
              </View>
            </View>
          )}
        />

        <Text
          className="
            mb-1
            mt-6
            text-lg
            font-bold
            text-foreground
          "
        >
          Lokacija
        </Text>

        <Text
          className="
            mb-4
            text-sm
            text-muted
          "
        >
          Lokacija je obavezna.
          Za sada unesite koordinate
          ručno.
        </Text>

        <Controller
          control={control}
          name="locationName"
          render={({
            field,
          }) => (
            <FormTextInput
              label="Naziv lokacije"
              value={
                field.value
              }
              onChangeText={
                field.onChange
              }
              placeholder="npr. Futog"
              error={
                errors
                  .locationName
                  ?.message
              }
            />
          )}
        />

        <Controller
          control={control}
          name="latitude"
          render={({
            field,
          }) => (
            <FormTextInput
              label="Geografska širina *"
              value={
                field.value
              }
              onChangeText={
                field.onChange
              }
              placeholder="45.267136"
              keyboardType="decimal-pad"
              error={
                errors.latitude
                  ?.message
              }
            />
          )}
        />

        <Controller
          control={control}
          name="longitude"
          render={({
            field,
          }) => (
            <FormTextInput
              label="Geografska dužina *"
              value={
                field.value
              }
              onChangeText={
                field.onChange
              }
              placeholder="19.833549"
              keyboardType="decimal-pad"
              error={
                errors.longitude
                  ?.message
              }
            />
          )}
        />

        <Controller
          control={control}
          name="altitudeMeters"
          render={({
            field,
          }) => (
            <FormTextInput
              label="Nadmorska visina (m)"
              value={
                field.value
              }
              onChangeText={
                field.onChange
              }
              placeholder="npr. 85"
              keyboardType="numbers-and-punctuation"
              error={
                errors
                  .altitudeMeters
                  ?.message
              }
            />
          )}
        />

        <Controller
          control={control}
          name="cadastralParcelNumber"
          render={({
            field,
          }) => (
            <FormTextInput
              label="Broj katastarske parcele"
              value={
                field.value
              }
              onChangeText={
                field.onChange
              }
              placeholder="npr. 1234/2"
              error={
                errors
                  .cadastralParcelNumber
                  ?.message
              }
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({
            field,
          }) => (
            <FormTextInput
              label="Opis lokacije"
              value={
                field.value
              }
              onChangeText={
                field.onChange
              }
              placeholder="Dodatne informacije o lokaciji..."
              multiline
              error={
                errors
                  .description
                  ?.message
              }
            />
          )}
        />

        <Text
          className="
            mb-1
            mt-6
            text-lg
            font-bold
            text-foreground
          "
        >
          Položaj pčelinjaka
        </Text>

        <Text
          className="
            mb-4
            text-sm
            text-muted
          "
        >
          Odaberite smer prema kome
          su okrenuta leta košnica.
        </Text>

        <Controller
          control={control}
          name="orientation"
          render={({
            field,
          }) => (
            <View className="mb-4">
              <View
                className="
                  flex-row
                  flex-wrap
                  gap-2
                "
              >
                {orientationOptions.map(
                  (option) => (
                    <OrientationChoice
                      key={
                        option.value
                      }
                      label={
                        option.label
                      }
                      selected={
                        field.value ===
                        option.value
                      }
                      onPress={() => {
                        field.onChange(
                          option.value,
                        );
                      }}
                    />
                  ),
                )}
              </View>

              {errors.orientation
                ?.message && (
                  <Text
                    className="
                    mt-2
                    text-sm
                    text-error
                  "
                  >
                    {
                      errors.orientation
                        .message
                    }
                  </Text>
                )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="stayNote"
          render={({
            field,
          }) => (
            <FormTextInput
              label="Napomena o boravku"
              value={
                field.value
              }
              onChangeText={
                field.onChange
              }
              placeholder="Dodatna napomena..."
              multiline
              error={
                errors.stayNote
                  ?.message
              }
            />
          )}
        />

        {createMutation.isError && (
          <View
            className="
              mb-4
              rounded-2xl
              bg-surface
              px-4
              py-3
            "
          >
            <Text
              className="
                text-sm
                text-error
              "
            >
              {createMutation
                .error instanceof
                Error
                ? createMutation
                  .error.message
                : 'Pčelinjak nije moguće sačuvati.'}
            </Text>
          </View>
        )}

        <Pressable
          disabled={
            createMutation
              .isPending
          }
          onPress={
            handleSubmit(
              onSubmit,
            )
          }
          className={`
            min-h-14
            items-center
            justify-center
            rounded-2xl
            bg-primary
            px-5
            ${createMutation
              .isPending
              ? 'opacity-60'
              : ''
            }
          `}
        >
          <Text
            className="
              text-base
              font-bold
              text-background
            "
          >
            {createMutation
              .isPending
              ? 'Čuvanje...'
              : 'Kreiraj pčelinjak'}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

type FormTextInputProps = {
  label: string;
  value: string;

  onChangeText:
  (value: string) => void;

  placeholder?: string;
  error?: string;
  multiline?: boolean;

  keyboardType?:
  | 'default'
  | 'decimal-pad'
  | 'numbers-and-punctuation';

  autoCapitalize?:
  | 'none'
  | 'sentences'
  | 'words'
  | 'characters';
};

function FormTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: FormTextInputProps) {
  return (
    <View className="mb-4">
      <Text
        className="
          mb-2
          text-sm
          font-semibold
          text-foreground
        "
      >
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={
          onChangeText
        }
        placeholder={
          placeholder
        }
        placeholderTextColor={
          colors.muted
        }
        keyboardType={
          keyboardType
        }
        autoCapitalize={
          autoCapitalize
        }
        multiline={
          multiline
        }
        textAlignVertical={
          multiline
            ? 'top'
            : 'center'
        }
        className={`
          rounded-2xl
          border
          px-4
          text-base
          text-foreground
          ${multiline
            ? 'min-h-28 py-3'
            : 'h-14'
          }
          ${error
            ? 'border-error'
            : 'border-border'
          }
          bg-surface
        `}
      />

      {error && (
        <Text
          className="
            mt-1
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

type ChoiceProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function Choice({
  label,
  selected,
  onPress,
}: ChoiceProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`
        flex-1
        items-center
        rounded-2xl
        border
        px-4
        py-3
        ${selected
          ? 'border-primary bg-primary'
          : 'border-border bg-surface'
        }
      `}
    >
      <Text
        className={`
          font-semibold
          ${selected
            ? 'text-background'
            : 'text-foreground'
          }
        `}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type OrientationChoiceProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function OrientationChoice({
  label,
  selected,
  onPress,
}: OrientationChoiceProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`
        min-w-[47%]
        flex-1
        items-center
        rounded-2xl
        border
        px-3
        py-3
        ${selected
          ? 'border-primary bg-primary'
          : 'border-border bg-surface'
        }
      `}
    >
      <Text
        className={`
          text-sm
          font-semibold
          ${selected
            ? 'text-background'
            : 'text-foreground'
          }
        `}
      >
        {label}
      </Text>
    </Pressable>
  );
}