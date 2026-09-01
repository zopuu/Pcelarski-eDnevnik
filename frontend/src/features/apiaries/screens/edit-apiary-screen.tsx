import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  router,
} from 'expo-router';

import {
  useEffect,
} from 'react';

import {
  Controller,
  useForm,
} from 'react-hook-form';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  useApiary,
} from '../hooks/use-apiary';

import {
  useUpdateApiary,
} from '../hooks/use-update-apiary';

import {
  updateApiarySchema,
  type UpdateApiaryFormValues,
} from '../schemas/update-apiary-schema';

import type {
  UpdateApiaryRequest,
} from '../types/update-apiary';

import {
  colors,
} from '@/shared/theme/colors';

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

export function EditApiaryScreen({
  apiaryId,
}: EditApiaryScreenProps) {
  const {
    data: apiary,
    isLoading,
    isError,
  } =
    useApiary(
      apiaryId,
    );

  const updateMutation =
    useUpdateApiary(
      apiaryId,
    );

  const {
    control,
    handleSubmit,
    reset,
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
        type: null,
      },
    });

  useEffect(() => {
    if (!apiary) {
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
    });
  }, [
    apiary,
    reset,
  ]);

  const onSubmit =
    async (
      values:
        UpdateApiaryFormValues,
    ) => {
      const request:
        UpdateApiaryRequest = {
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
      };

      try {
        await updateMutation
          .mutateAsync(
            request,
          );

        router.back();
      } catch {
        /*
         * Mutation error is rendered
         * below the form.
         */
      }
    };

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
    isError ||
    !apiary
  ) {
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
          Nije moguće učitati
          podatke o pčelinjaku.
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

  return (
    <View
      className="
        flex-1
        bg-background
      "
    >
      <ScrollView
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

        <View
          className="
            mt-8
          "
        >
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
              <View
                className="
                  mb-4
                "
              >
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
                    flex-wrap
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
        </View>

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
            !isDirty
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
              !isDirty
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
              .isPending
              ? 'Čuvanje...'
              : 'Sačuvaj izmene'}
          </Text>
        </Pressable>
      </ScrollView>
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
    <View
      className="
        mb-4
      "
    >
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