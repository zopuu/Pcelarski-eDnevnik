import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  router,
} from 'expo-router';

import {
  Controller,
  useForm,
  useWatch,
} from 'react-hook-form';

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  useCreateHive,
} from '../hooks/use-create-hive';

import {
  createHiveSchema,
  type CreateHiveFormInput,
  type CreateHiveFormValues,
} from '../schemas/create-hive-schema';

import type {
  CreateHiveRequest,
} from '../types/create-hive';

import type {
  HiveMaterial,
  HiveType,
} from '../types/hive';

import {
  colors,
} from '@/shared/theme/colors';
import {
  DatePickerField,
} from '@/shared/components/date-picker-field';
import {
  getCurrentUtcDateOnly,
} from '@/shared/utils/date-only';
import {
  HiveColorPicker,
} from '../components/hive-color-picker';
import {
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

type CreateHiveScreenProps = {
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

const hiveTypeOptions: {
  value: HiveType;
  label: string;
}[] = [
    {
      value:
        'dadantBlatt',
      label: 'DB',
    },
    {
      value:
        'langstrothRoot',
      label: 'LR',
    },
    {
      value:
        'albertiZnidersic',
      label: 'AŽ',
    },
    {
      value: 'farrar',
      label: 'Farar',
    },
    {
      value: 'nucleus',
      label: 'Nukleus',
    },
    {
      value: 'other',
      label: 'Ostalo',
    },
  ];

const materialOptions: {
  value: HiveMaterial;
  label: string;
}[] = [
    {
      value: 'wood',
      label: 'Drvo',
    },
    {
      value:
        'polystyrene',
      label: 'Polistiren',
    },
    {
      value:
        'polyurethane',
      label: 'Poliuretan',
    },
    {
      value: 'plastic',
      label: 'Plastika',
    },
    {
      value: 'other',
      label: 'Ostalo',
    },
  ];

export function CreateHiveScreen({
  apiaryId,
}: CreateHiveScreenProps) {
  const createMutation =
    useCreateHive(
      apiaryId,
    );

  const {
    control,
    handleSubmit,
    formState: {
      errors,
    },
  } =
    useForm<
      CreateHiveFormInput,
      unknown,
      CreateHiveFormValues
    >({
      resolver:
        zodResolver(
          createHiveSchema,
        ),

      defaultValues: {
        label: '',
        identificationNumber:
          '',
        type: null,
        colorHex: '',
        manufactureDate:
          '',
        manufacturer: '',
        material: null,
        purchaseDate: '',
      },
    });

  const manufactureDate =
    useWatch({
      control,
      name: 'manufactureDate',
    });

  const purchaseDate =
    useWatch({
      control,
      name: 'purchaseDate',
    });

  const today =
    getCurrentUtcDateOnly();

  const onSubmit =
    async (
      values:
        CreateHiveFormValues,
    ) => {
      const request:
        CreateHiveRequest = {
        label:
          values.label.trim(),

        identificationNumber:
          optionalText(
            values
              .identificationNumber,
          ),

        type:
          values.type,

        colorHex:
          optionalText(
            values.colorHex,
          )?.toUpperCase() ??
          null,

        manufactureDate:
          optionalText(
            values
              .manufactureDate,
          ),

        manufacturer:
          optionalText(
            values.manufacturer,
          ),

        material:
          values.material,

        purchaseDate:
          optionalText(
            values.purchaseDate,
          ),
      };

      try {
        await createMutation
          .mutateAsync(
            request,
          );

        router.replace({
          pathname:
            '/apiaries/[apiaryId]',

          params: {
            apiaryId,
          },
        });
      } catch {
        /*
         * Mutation error is
         * displayed below.
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
          Nova košnica
        </Text>

        <Text
          className="
            mt-1
            text-sm
            text-muted
          "
        >
          Unesite osnovne podatke
          o košnici.
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
          Osnovni podaci
        </Text>

        <Controller
          control={control}
          name="label"
          render={({
            field,
          }) => (
            <FormTextInput
              label="Oznaka *"
              value={
                field.value
              }
              onChangeText={
                field.onChange
              }
              placeholder="npr. 12"
              error={
                errors.label
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
              placeholder="RS12345678"
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
                Tip košnice *
              </Text>

              <View
                className="
                  flex-row
                  flex-wrap
                  gap-2
                "
              >
                {hiveTypeOptions.map(
                  (option) => (
                    <Choice
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

              {errors.type
                ?.message && (
                  <Text
                    className="
                    mt-2
                    text-sm
                    text-error
                  "
                  >
                    {
                      errors.type
                        .message
                    }
                  </Text>
                )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="colorHex"
          render={({
            field,
          }) => (
            <HiveColorPicker
              value={field.value}
              onChange={
                field.onChange
              }
              error={
                errors.colorHex
                  ?.message
              }
            />
          )}
        />

        <Text
          className="
            mb-3
            mt-6
            text-lg
            font-bold
            text-foreground
          "
        >
          Dodatni podaci
        </Text>

        <Controller
          control={control}
          name="manufacturer"
          render={({
            field,
          }) => (
            <FormTextInput
              label="Proizvođač"
              value={
                field.value
              }
              onChangeText={
                field.onChange
              }
              placeholder="Naziv proizvođača"
              error={
                errors
                  .manufacturer
                  ?.message
              }
            />
          )}
        />

        <Controller
          control={control}
          name="material"
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
                Materijal
              </Text>

              <View
                className="
                  flex-row
                  flex-wrap
                  gap-2
                "
              >
                {materialOptions.map(
                  (option) => (
                    <Choice
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
            </View>
          )}
        />

        <Controller
          control={control}
          name="manufactureDate"
          render={({
            field,
          }) => (
            <DatePickerField
              label="Datum proizvodnje"
              value={
                field.value
              }
              onChange={
                field.onChange
              }
              maximumDate={
                purchaseDate &&
                purchaseDate < today
                  ? purchaseDate
                  : today
              }
              error={
                errors
                  .manufactureDate
                  ?.message
              }
            />
          )}
        />

        <Controller
          control={control}
          name="purchaseDate"
          render={({
            field,
          }) => (
            <DatePickerField
              label="Datum nabavke"
              value={
                field.value
              }
              onChange={
                field.onChange
              }
              minimumDate={
                manufactureDate ||
                undefined
              }
              maximumDate={today}
              error={
                errors
                  .purchaseDate
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
                : 'Košnicu nije moguće sačuvati.'}
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
              : 'Kreiraj košnicu'}
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
        className={`
          h-14
          rounded-2xl
          border
          bg-surface
          px-4
          text-base
          text-foreground
          ${error
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
        min-w-[30%]
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
