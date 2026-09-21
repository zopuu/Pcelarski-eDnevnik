import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  router,
} from 'expo-router';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Controller,
  useForm,
  useWatch,
} from 'react-hook-form';

import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

import {
  useApiary,
} from '@/features/apiaries/hooks/use-apiary';

import {
  useCurrentApiaryStay,
} from '@/features/apiaries/hooks/use-current-apiary-stay';

import {
  useUpdateApiary,
} from '@/features/apiaries/hooks/use-update-apiary';
import {
  ApiaryImagePicker,
} from '@/features/apiaries/components/apiary-image-picker';

import {
  useLocation,
} from '@/features/apiaries/hooks/use-location';

import {
  updateApiarySchema,
} from '@/features/apiaries/schemas/update-apiary-schema';

import type {
  UpdateApiaryFormValues,
} from '@/features/apiaries/schemas/update-apiary-schema';

import type {
  HiveEntranceOrientation,
} from '@/features/apiaries/types/apiary-stay';
import type {
  ApiaryImageUpload,
} from '@/features/apiaries/types/apiary-image';

import {
  colors,
} from '@/shared/theme/colors';

import {
  MapLocationPicker,
} from '@/shared/components/map-location-picker/map-location-picker';

import type {
  GeographicCoordinates,
} from '@/shared/api/open-topo-data';

type EditApiaryScreenProps = {
  apiaryId: string;
};

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

function parseSelectedCoordinate(
  value: string,
): number | null {
  if (!value.trim()) {
    return null;
  }

  const coordinate =
    parseCoordinate(value);

  return Number.isFinite(coordinate)
    ? coordinate
    : null;
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

export function EditApiaryScreen({
  apiaryId,
}: EditApiaryScreenProps) {
  const {
    data: apiary,
    isLoading:
      isApiaryLoading,
    isError:
      isApiaryError,
  } =
    useApiary(
      apiaryId,
    );

  const {
    data: currentStay,
    isLoading:
      isStayLoading,
    isError:
      isStayError,
  } =
    useCurrentApiaryStay(
      apiaryId,
    );

  const {
    data: location,
    isLoading:
      isLocationLoading,
    isError:
      isLocationError,
  } =
    useLocation(
      currentStay?.locationId ?? '',
    );

  const updateMutation =
    useUpdateApiary();
  const [image, setImage] =
    useState<ApiaryImageUpload | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: {
      errors,
      isDirty,
    },
  } =
    useForm<UpdateApiaryFormValues>({
      resolver:
        zodResolver(
          updateApiarySchema,
        ),

      defaultValues: {
        name: '',

        identificationNumber:
          '',

        type: undefined,

        latitude: '',
        longitude: '',
        altitudeMeters: '',

        orientation:
          null,
      },
    });

  const latitude =
    useWatch({
      control,
      name: 'latitude',
    });

  const longitude =
    useWatch({
      control,
      name: 'longitude',
    });

  const [
    isElevationLoading,
    setIsElevationLoading,
  ] = useState(false);

  const hasManualAltitudeOverride =
    useRef(false);

  const latitudeNumber =
    parseSelectedCoordinate(latitude);

  const longitudeNumber =
    parseSelectedCoordinate(longitude);

  const selectedLocation =
    latitudeNumber !== null &&
    longitudeNumber !== null
      ? {
        latitude: latitudeNumber,
        longitude: longitudeNumber,
      }
      : null;

  useEffect(() => {
    if (
      !apiary ||
      !currentStay ||
      !location
    ) {
      return;
    }

    reset({
      name:
        apiary.name ?? '',

      identificationNumber:
        apiary
          .identificationNumber ??
        '',

      type:
        apiary.type,

      latitude:
        location.latitude.toString(),

      longitude:
        location.longitude.toString(),

      altitudeMeters:
        location.altitudeMeters
          ?.toString() ??
        '',

      orientation:
        currentStay
          .orientation,
    });
  }, [
    apiary,
    currentStay,
    location,
    reset,
  ]);

  const handleLocationChange = (
    coordinates: GeographicCoordinates,
  ) => {
    hasManualAltitudeOverride.current =
      false;

    setValue(
      'latitude',
      coordinates.latitude.toFixed(6),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );

    setValue(
      'longitude',
      coordinates.longitude.toFixed(6),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const handleAltitudeChange = (
    altitudeMeters: number | null,
  ) => {
    if (hasManualAltitudeOverride.current) {
      return;
    }

    setValue(
      'altitudeMeters',
      altitudeMeters?.toString() ?? '',
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const onSubmit =
    async (
      values:
        UpdateApiaryFormValues,
    ) => {
      if (
        !currentStay ||
        !location
      ) {
        return;
      }

      try {
        await updateMutation
          .mutateAsync({
            apiaryId,

            stayId:
              currentStay.id,

            locationId:
              location.id,

            apiary: {
              image,
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
            },

            stay: {
              orientation:
                values.orientation,
            },

            location: {
              name:
                location.name,

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
                  values.altitudeMeters,
                ),

              cadastralParcelNumber:
                location
                  .cadastralParcelNumber,

              description:
                location.description,
            },
          });

        router.back();
      } catch {
        /*
         * Mutation error is
         * displayed below.
         */
      }
    };

  const isLoading =
    isApiaryLoading ||
    isStayLoading ||
    isLocationLoading;

  const hasChanges =
    isDirty || image !== null;

  if (isLoading) {
    return (
      <View
        className="
          flex-1
          items-center
          justify-center
          bg-background
        "
      >
        <ActivityIndicator
          size="large"
          color={
            colors.primary
          }
        />

        <Text
          className="
            mt-3
            text-muted
          "
        >
          Učitavanje pčelinjaka...
        </Text>
      </View>
    );
  }

  if (
    isApiaryError ||
    !apiary
  ) {
    return (
      <LoadError
        message="
          Nije moguće učitati
          podatke o pčelinjaku.
        "
      />
    );
  }

  if (
    isStayError ||
    !currentStay ||
    isLocationError ||
    !location
  ) {
    return (
      <LoadError
        message="
          Trenutni boravak
          pčelinjaka nije pronađen.
        "
      />
    );
  }

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
          Izmeni pčelinjak
        </Text>

        <Text
          className="
            mt-1
            text-sm
            text-muted
          "
        >
          Izmenite osnovne podatke
          o pčelinjaku.
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
                Tip pčelinjaka *
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

              {errors.type?.message && (
                <Text
                  className="
                    mt-2
                    text-sm
                    text-error
                  "
                >
                  {errors.type.message}
                </Text>
              )}
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
          Lokacija pčelinjaka
        </Text>

        <Text
          className="
            mb-4
            text-sm
            text-muted
          "
        >
          Dodirnite satelitski snimak da
          promenite poziciju. Koordinate
          i nadmorska visina se popunjavaju
          automatski.
        </Text>

        <MapLocationPicker
          value={selectedLocation}
          onLocationChange={
            handleLocationChange
          }
          onAltitudeChange={
            handleAltitudeChange
          }
          onElevationLoadingChange={
            setIsElevationLoading
          }
          error={
            errors.latitude?.message ??
            errors.longitude?.message
          }
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
              onChangeText={(value) => {
                hasManualAltitudeOverride.current =
                  true;
                field.onChange(value);
              }}
              placeholder="npr. 85"
              keyboardType="numbers-and-punctuation"
              error={
                errors.altitudeMeters
                  ?.message
              }
            />
          )}
        />

        <ApiaryImagePicker
          value={image}
          imageUrl={apiary.imageUrl}
          onChange={setImage}
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
                          field.value ===
                            option.value
                            ? null
                            : option.value,
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
                    errors
                      .orientation
                      .message
                  }
                </Text>
              )}
            </View>
          )}
        />

        {updateMutation
          .isError && (
          <View
            className="
              mb-4
              rounded-2xl
              border
              border-error/30
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
              {updateMutation
                .error instanceof
              Error
                ? updateMutation
                    .error.message
                : 'Pčelinjak nije moguće ažurirati.'}
            </Text>
          </View>
        )}

        <Pressable
          disabled={
            updateMutation
              .isPending ||
            isElevationLoading ||
            !hasChanges
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
            ${
              updateMutation
                .isPending ||
              isElevationLoading ||
              !hasChanges
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
            {updateMutation
              .isPending ||
              isElevationLoading
              ? 'Čuvanje...'
              : 'Sačuvaj izmene'}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

type LoadErrorProps = {
  message: string;
};

function LoadError({
  message,
}: LoadErrorProps) {
  return (
    <View
      className="
        flex-1
        items-center
        justify-center
        bg-background
        px-8
      "
    >
      <Text
        className="
          text-center
          text-base
          font-semibold
          text-error
        "
      >
        {message}
      </Text>

      <Pressable
        onPress={() => {
          router.back();
        }}
        className="
          mt-5
          rounded-2xl
          bg-primary
          px-5
          py-3
        "
      >
        <Text
          className="
            font-bold
            text-background
          "
        >
          Nazad
        </Text>
      </Pressable>
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

  keyboardType?:
    | 'default'
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
        autoCapitalize={
          autoCapitalize
        }
        keyboardType={
          keyboardType
        }
        className={`
          h-14
          rounded-2xl
          border
          bg-surface
          px-4
          text-base
          text-foreground
          ${
            error
              ? 'border-error'
              : 'border-border'
          }
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

  onPress:
    () => void;
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
        ${
          selected
            ? 'border-primary bg-primary'
            : 'border-border bg-surface'
        }
      `}
    >
      <Text
        className={`
          font-semibold
          ${
            selected
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

  onPress:
    () => void;
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
        ${
          selected
            ? 'border-primary bg-primary'
            : 'border-border bg-surface'
        }
      `}
    >
      <Text
        className={`
          text-sm
          font-semibold
          ${
            selected
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
