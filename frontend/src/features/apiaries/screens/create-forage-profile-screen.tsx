import Ionicons from '@react-native-vector-icons/ionicons';
import {
  zodResolver,
} from '@hookform/resolvers/zod';
import {
  router,
} from 'expo-router';
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

import {
  useCreateForageProfile,
} from '../hooks/use-create-forage-profile';
import {
  createForageProfileSchema,
  type CreateForageProfileFormInput,
  type CreateForageProfileFormValues,
  type SelectableForageType,
} from '../schemas/create-forage-profile-schema';
import type {
  CreateForageProfileRequest,
} from '../types/forage-profile';

import {
  ApiError,
} from '@/shared/api/api-error';
import {
  colors,
} from '@/shared/theme/colors';

type CreateForageProfileScreenProps = {
  apiaryId: string;
};

type ForageTypeOption = {
  value: SelectableForageType;
  label: string;
};

const forageTypeOptions: ForageTypeOption[] = [
  { value: 'meadow', label: 'Livada' },
  { value: 'forest', label: 'Šuma' },
  { value: 'sunflower', label: 'Suncokret' },
  { value: 'acacia', label: 'Bagrem' },
  { value: 'linden', label: 'Lipa' },
  { value: 'oilseedRape', label: 'Uljana repica' },
  { value: 'clover', label: 'Detelina' },
  { value: 'fruitTrees', label: 'Voćke' },
  { value: 'chestnut', label: 'Kesten' },
  { value: 'buckwheat', label: 'Heljda' },
];

function optionalText(
  value: string,
): string | null {
  const trimmed = value.trim();

  return trimmed || null;
}

function getInitialYear() {
  return String(
    new Date().getFullYear(),
  );
}

function getTotalPercentage(
  items: CreateForageProfileFormInput['items'],
) {
  const total = items.reduce(
    (sum, item) => {
      const percentage = Number(
        item.percentage.replace(',', '.'),
      );

      return Number.isFinite(percentage)
        ? sum + percentage
        : sum;
    },
    0,
  );

  return Math.round(
    (total + Number.EPSILON) * 100,
  ) / 100;
}

function getCreateErrorMessage(
  error: unknown,
) {
  if (
    error instanceof ApiError &&
    error.problem?.code ===
      'forage_profiles.current_stay_year_already_has_profile'
  ) {
    return 'Profil paše za izabranu godinu već postoji.';
  }

  return 'Profil paše nije moguće sačuvati. Pokušajte ponovo.';
}

export function CreateForageProfileScreen({
  apiaryId,
}: CreateForageProfileScreenProps) {
  const createMutation =
    useCreateForageProfile(
      apiaryId,
    );

  const {
    control,
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm<
    CreateForageProfileFormInput,
    unknown,
    CreateForageProfileFormValues
  >({
    resolver:
      zodResolver(
        createForageProfileSchema,
      ),

    defaultValues: {
      year: getInitialYear(),
      radiusKm: '',
      name: '',
      notes: '',
      items: [
        {
          forageType: null,
          percentage: '',
          intensity: 3,
          notes: '',
        },
      ],
    },
  });

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'items',
  });

  const items = useWatch({
    control,
    name: 'items',
  });

  const selectedForageTypes =
    new Set(
      items
        .map(
          (item) => item.forageType,
        )
        .filter(
          (
            forageType,
          ): forageType is SelectableForageType =>
            forageType !== null,
        ),
    );

  const totalPercentage =
    getTotalPercentage(items);

  const missingPercentage =
    Math.max(
      0,
      100 - totalPercentage,
    );

  const onSubmit = async (
    values: CreateForageProfileFormValues,
  ) => {
    const request: CreateForageProfileRequest = {
      year: values.year,
      radiusKm: values.radiusKm,
      name: values.name,
      notes: optionalText(values.notes),
      items: values.items.map(
        (item) => ({
          forageType: item.forageType,
          percentage: item.percentage,
          intensity: item.intensity,
          notes: optionalText(item.notes),
        }),
      ),
    };

    try {
      await createMutation.mutateAsync(
        request,
      );

      router.replace({
        pathname:
          '/apiaries/[apiaryId]/forage-profiles',
        params: {
          apiaryId,
        },
      } as never);
    } catch {
      // The recoverable mutation error is shown below the form.
    }
  };

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 48,
        }}
      >
        <Pressable
          onPress={() => {
            router.back();
          }}
          className="mb-5 self-start py-2"
        >
          <Text className="text-base font-semibold text-primary">
            ← Nazad
          </Text>
        </Pressable>

        <Text className="text-2xl font-bold text-foreground">
          Novi profil paše
        </Text>

        <Text className="mt-1 text-sm text-muted">
          Unesite zastupljenost paše u okolini pčelinjaka.
        </Text>

        <SectionTitle>Osnovni podaci</SectionTitle>

        <Controller
          control={control}
          name="year"
          render={({ field }) => (
            <FormTextInput
              label="Godina *"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="number-pad"
              maxLength={4}
              error={errors.year?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <FormTextInput
              label="Naziv profila *"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="npr. Prolećna paša"
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="radiusKm"
          render={({ field }) => (
            <FormTextInput
              label="Poluprečnik (km)"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="1–4"
              keyboardType="number-pad"
              maxLength={1}
              error={errors.radiusKm?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <FormTextInput
              label="Napomena"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Dodajte napomenu..."
              multiline
              error={errors.notes?.message}
            />
          )}
        />

        <View className="mb-3 mt-5 flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">
              Vrste paše
            </Text>
            <Text className="mt-1 text-sm text-muted">
              Ostalo se automatski dodaje do 100%.
            </Text>
          </View>

          <View className="rounded-full bg-primary/10 px-3 py-1.5">
            <Text className="text-xs font-bold text-primary">
              {totalPercentage.toFixed(2)}%
            </Text>
          </View>
        </View>

        {fields.map((field, index) => (
          <ForageItemForm
            key={field.id}
            control={control}
            index={index}
            canRemove={fields.length > 1}
            selectedForageTypes={selectedForageTypes}
            errors={errors}
            onRemove={() => {
              remove(index);
            }}
          />
        ))}

        {errors.items?.message && (
          <Text className="mb-3 text-sm text-error">
            {errors.items.message}
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dodaj vrstu paše"
          onPress={() => {
            append({
              forageType: null,
              percentage: '',
              intensity: 3,
              notes: '',
            });
          }}
          className="mb-4 min-h-14 items-center justify-center rounded-2xl border border-primary bg-surface px-5"
        >
          <Text className="text-base font-bold text-primary">
            + Dodaj vrstu paše
          </Text>
        </Pressable>

        {missingPercentage > 0 && (
          <View className="mb-4 rounded-2xl bg-primary/10 px-4 py-3">
            <Text className="text-sm text-foreground">
              Server će dodati „Ostalo“ sa {missingPercentage.toFixed(2)}%.
            </Text>
          </View>
        )}

        {createMutation.isError && (
          <View className="mb-4 rounded-2xl border border-error/30 bg-surface px-4 py-3">
            <Text className="text-sm text-error">
              {getCreateErrorMessage(
                createMutation.error,
              )}
            </Text>
          </View>
        )}

        <Pressable
          disabled={createMutation.isPending}
          onPress={handleSubmit(onSubmit)}
          className={`
            min-h-14
            items-center
            justify-center
            rounded-2xl
            bg-primary
            px-5
            ${createMutation.isPending ? 'opacity-60' : ''}
          `}
        >
          <Text className="text-base font-bold text-background">
            {createMutation.isPending
              ? 'Čuvanje...'
              : 'Kreiraj profil paše'}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

function ForageItemForm({
  control,
  index,
  canRemove,
  selectedForageTypes,
  errors,
  onRemove,
}: {
  control: ReturnType<
    typeof useForm<
      CreateForageProfileFormInput,
      unknown,
      CreateForageProfileFormValues
    >
  >['control'];
  index: number;
  canRemove: boolean;
  selectedForageTypes: Set<SelectableForageType>;
  errors: ReturnType<
    typeof useForm<
      CreateForageProfileFormInput,
      unknown,
      CreateForageProfileFormValues
    >
  >['formState']['errors'];
  onRemove: () => void;
}) {
  const currentForageType = useWatch({
    control,
    name: `items.${index}.forageType`,
  });

  return (
    <View className="mb-4 rounded-3xl border border-border bg-surface p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-bold text-foreground">
          Vrsta paše {index + 1}
        </Text>

        {canRemove && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ukloni vrstu paše ${index + 1}`}
            onPress={onRemove}
            className="min-h-10 min-w-10 items-center justify-center rounded-full bg-error/10"
          >
            <Ionicons
              name="trash-outline"
              size={19}
              color={colors.error}
            />
          </Pressable>
        )}
      </View>

      <Controller
        control={control}
        name={`items.${index}.forageType`}
        render={({ field }) => (
          <ForageTypePicker
            value={field.value}
            onChange={field.onChange}
            selectedForageTypes={selectedForageTypes}
            currentForageType={currentForageType}
            error={errors.items?.[index]?.forageType?.message}
          />
        )}
      />

      <Controller
        control={control}
        name={`items.${index}.percentage`}
        render={({ field }) => (
          <FormTextInput
            label="Zastupljenost (%) *"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="npr. 40"
            keyboardType="decimal-pad"
            error={errors.items?.[index]?.percentage?.message}
          />
        )}
      />

      <Controller
        control={control}
        name={`items.${index}.intensity`}
        render={({ field }) => (
          <IntensityPicker
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name={`items.${index}.notes`}
        render={({ field }) => (
          <FormTextInput
            label="Napomena"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="Opcionalno"
            multiline
            error={errors.items?.[index]?.notes?.message}
          />
        )}
      />
    </View>
  );
}

function ForageTypePicker({
  value,
  onChange,
  selectedForageTypes,
  currentForageType,
  error,
}: {
  value: SelectableForageType | null;
  onChange: (value: SelectableForageType) => void;
  selectedForageTypes: Set<SelectableForageType>;
  currentForageType: SelectableForageType | null;
  error?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">
        Vrsta *
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {forageTypeOptions.map((option) => {
          const isSelected = value === option.value;
          const isUsedByAnotherItem =
            selectedForageTypes.has(option.value) &&
            currentForageType !== option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{
                selected: isSelected,
                disabled: isUsedByAnotherItem,
              }}
              disabled={isUsedByAnotherItem}
              onPress={() => {
                onChange(option.value);
              }}
              className={`
                min-h-11
                items-center
                justify-center
                rounded-xl
                border
                px-3
                ${isSelected
                  ? 'border-primary bg-primary'
                  : 'border-border bg-background'
                }
                ${isUsedByAnotherItem ? 'opacity-40' : ''}
              `}
            >
              <Text className={`text-sm font-semibold ${isSelected ? 'text-background' : 'text-foreground'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error && (
        <Text className="mt-1 text-sm text-error">
          {error}
        </Text>
      )}
    </View>
  );
}

function IntensityPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">
        Jačina paše *
      </Text>

      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((intensity) => {
          const isSelected = value === intensity;

          return (
            <Pressable
              key={intensity}
              accessibilityRole="button"
              accessibilityLabel={`Jačina ${intensity}`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                onChange(intensity);
              }}
              className={`
                min-h-12
                flex-1
                items-center
                justify-center
                rounded-xl
                border
                ${isSelected
                  ? 'border-primary bg-primary'
                  : 'border-border bg-background'
                }
              `}
            >
              <Text className={`font-bold ${isSelected ? 'text-background' : 'text-foreground'}`}>
                {intensity}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function FormTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  maxLength,
  multiline = false,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad';
  maxLength?: number;
  multiline?: boolean;
  error?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={`
          ${multiline ? 'min-h-28 py-3' : 'h-14'}
          rounded-2xl
          border
          bg-surface
          px-4
          text-base
          text-foreground
          ${error ? 'border-error' : 'border-border'}
        `}
      />

      {error && (
        <Text className="mt-1 text-sm text-error">
          {error}
        </Text>
      )}
    </View>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Text className="mb-3 mt-8 text-lg font-bold text-foreground">
      {children}
    </Text>
  );
}
