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
  HiveColorPicker,
} from '../components/hive-color-picker';
import {
  useHive,
} from '../hooks/use-hive';
import {
  useUpdateHive,
} from '../hooks/use-update-hive';
import {
  updateHiveSchema,
} from '../schemas/update-hive-schema';
import type {
  UpdateHiveFormInput,
  UpdateHiveFormValues,
} from '../schemas/update-hive-schema';
import type {
  HiveMaterial,
  HiveType,
} from '../types/hive';
import type {
  UpdateHiveRequest,
} from '../types/update-hive';

import {
  DatePickerField,
} from '@/shared/components/date-picker-field';
import {
  colors,
} from '@/shared/theme/colors';
import {
  getCurrentUtcDateOnly,
} from '@/shared/utils/date-only';

type EditHiveScreenProps = {
  hiveId: string;
};

const hiveTypeOptions: {
  value: HiveType;
  label: string;
}[] = [
  { value: 'dadantBlatt', label: 'DB' },
  { value: 'langstrothRoot', label: 'LR' },
  { value: 'albertiZnidersic', label: 'AŽ' },
  { value: 'farrar', label: 'Farar' },
  { value: 'nucleus', label: 'Nukleus' },
  { value: 'other', label: 'Ostalo' },
];

const materialOptions: {
  value: HiveMaterial;
  label: string;
}[] = [
  { value: 'wood', label: 'Drvo' },
  { value: 'polystyrene', label: 'Polistiren' },
  { value: 'polyurethane', label: 'Poliuretan' },
  { value: 'plastic', label: 'Plastika' },
  { value: 'other', label: 'Ostalo' },
];

function optionalText(value: string): string | null {
  const normalized = value.trim();

  return normalized || null;
}

export function EditHiveScreen({
  hiveId,
}: EditHiveScreenProps) {
  const hiveQuery = useHive(hiveId);
  const updateMutation = useUpdateHive();

  const {
    control,
    handleSubmit,
    reset,
    formState: {
      errors,
      isDirty,
    },
  } = useForm<
    UpdateHiveFormInput,
    unknown,
    UpdateHiveFormValues
  >({
    resolver: zodResolver(updateHiveSchema),
    defaultValues: {
      label: '',
      identificationNumber: '',
      type: null,
      colorHex: '',
      manufactureDate: '',
      manufacturer: '',
      material: null,
      purchaseDate: '',
      hasFeeder: false,
      feederVolumeMl: '',
      note: '',
    },
  });

  const manufactureDate = useWatch({
    control,
    name: 'manufactureDate',
  });
  const purchaseDate = useWatch({
    control,
    name: 'purchaseDate',
  });
  const hasFeeder = useWatch({
    control,
    name: 'hasFeeder',
  });

  useEffect(() => {
    const hive = hiveQuery.data;

    if (!hive) {
      return;
    }

    reset({
      label: hive.label,
      identificationNumber: hive.identificationNumber ?? '',
      type: hive.type,
      colorHex: hive.colorHex ?? '',
      manufactureDate: hive.manufactureDate ?? '',
      manufacturer: hive.manufacturer ?? '',
      material: hive.material,
      purchaseDate: hive.purchaseDate ?? '',
      hasFeeder: hive.hasFeeder,
      feederVolumeMl: hive.feederVolumeMl?.toString() ?? '',
      note: hive.note ?? '',
    });
  }, [hiveQuery.data, reset]);

  const onSubmit = async (values: UpdateHiveFormValues) => {
    const request: UpdateHiveRequest = {
      label: values.label.trim(),
      identificationNumber: optionalText(values.identificationNumber),
      type: values.type,
      colorHex: optionalText(values.colorHex)?.toUpperCase() ?? null,
      manufactureDate: optionalText(values.manufactureDate),
      manufacturer: optionalText(values.manufacturer),
      material: values.material,
      purchaseDate: optionalText(values.purchaseDate),
      hasFeeder: values.hasFeeder,
      feederVolumeMl: values.hasFeeder
        ? Number(values.feederVolumeMl)
        : null,
      note: optionalText(values.note),
    };

    try {
      await updateMutation.mutateAsync({
        hiveId,
        request,
      });

      router.back();
    } catch {
      // The recoverable mutation error is shown below the form.
    }
  };

  if (hiveQuery.isLoading) {
    return <LoadingState label="Učitavanje košnice..." />;
  }

  if (hiveQuery.isError || !hiveQuery.data) {
    return <LoadError />;
  }

  const today = getCurrentUtcDateOnly();

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
          Izmeni košnicu
        </Text>

        <Text className="mt-1 text-sm text-muted">
          Izmenite osnovne podatke i opremu košnice.
        </Text>

        <SectionTitle>Osnovni podaci</SectionTitle>

        <Controller
          control={control}
          name="label"
          render={({ field }) => (
            <FormTextInput
              label="Oznaka *"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="npr. 12"
              error={errors.label?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="identificationNumber"
          render={({ field }) => (
            <FormTextInput
              label="Identifikacioni broj"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="RS12345678"
              autoCapitalize="characters"
              error={errors.identificationNumber?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <ChoiceGroup
              label="Tip košnice *"
              options={hiveTypeOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.type?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="colorHex"
          render={({ field }) => (
            <HiveColorPicker
              value={field.value}
              onChange={field.onChange}
              error={errors.colorHex?.message}
            />
          )}
        />

        <SectionTitle>Dodatni podaci</SectionTitle>

        <Controller
          control={control}
          name="manufacturer"
          render={({ field }) => (
            <FormTextInput
              label="Proizvođač"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="Naziv proizvođača"
              error={errors.manufacturer?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="material"
          render={({ field }) => (
            <ChoiceGroup
              label="Materijal"
              options={materialOptions}
              value={field.value}
              onChange={(value) => {
                field.onChange(field.value === value ? null : value);
              }}
              error={errors.material?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="manufactureDate"
          render={({ field }) => (
            <DatePickerField
              label="Datum proizvodnje"
              value={field.value}
              onChange={field.onChange}
              maximumDate={
                purchaseDate && purchaseDate < today
                  ? purchaseDate
                  : today
              }
              error={errors.manufactureDate?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="purchaseDate"
          render={({ field }) => (
            <DatePickerField
              label="Datum nabavke"
              value={field.value}
              onChange={field.onChange}
              minimumDate={manufactureDate || undefined}
              maximumDate={today}
              error={errors.purchaseDate?.message}
            />
          )}
        />

        <SectionTitle>Hranilica</SectionTitle>

        <Controller
          control={control}
          name="hasFeeder"
          render={({ field }) => (
            <ChoiceGroup
              label="Da li košnica ima hranilicu?"
              options={[
                { value: true, label: 'Ima' },
                { value: false, label: 'Nema' },
              ]}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {hasFeeder && (
          <Controller
            control={control}
            name="feederVolumeMl"
            render={({ field }) => (
              <FormTextInput
                label="Zapremina hranilice (ml) *"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="npr. 1000"
                keyboardType="numeric"
                error={errors.feederVolumeMl?.message}
              />
            )}
          />
        )}

        <SectionTitle>Napomena</SectionTitle>

        <Controller
          control={control}
          name="note"
          render={({ field }) => (
            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-foreground">
                Napomena
              </Text>

              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Dodatne informacije o košnici"
                placeholderTextColor={colors.muted}
                multiline
                textAlignVertical="top"
                className={`min-h-32 rounded-2xl border bg-surface px-4 py-3 text-base text-foreground ${
                  errors.note ? 'border-error' : 'border-border'
                }`}
              />

              {errors.note?.message && (
                <Text className="mt-1 text-sm text-error">
                  {errors.note.message}
                </Text>
              )}
            </View>
          )}
        />

        {updateMutation.isError && (
          <View className="mb-4 rounded-2xl border border-error/30 bg-surface px-4 py-3">
            <Text className="text-sm text-error">
              {updateMutation.error instanceof Error
                ? updateMutation.error.message
                : 'Košnicu nije moguće ažurirati. Pokušajte ponovo.'}
            </Text>
          </View>
        )}

        <Pressable
          disabled={updateMutation.isPending || !isDirty}
          onPress={handleSubmit(onSubmit)}
          className={`min-h-14 items-center justify-center rounded-2xl bg-primary px-5 ${
            updateMutation.isPending || !isDirty ? 'opacity-60' : ''
          }`}
        >
          <Text className="text-base font-bold text-background">
            {updateMutation.isPending ? 'Čuvanje...' : 'Sačuvaj izmene'}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-3 mt-8 text-lg font-bold text-foreground">
      {children}
    </Text>
  );
}

function ChoiceGroup<T extends string | boolean>({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">
        {label}
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <Pressable
              key={String(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                onChange(option.value);
              }}
              className={`min-h-12 min-w-[30%] flex-1 items-center justify-center rounded-2xl border px-3 ${
                selected
                  ? 'border-primary bg-primary'
                  : 'border-border bg-surface'
              }`}
            >
              <Text className={`font-semibold ${
                selected ? 'text-background' : 'text-foreground'
              }`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error && (
        <Text className="mt-2 text-sm text-error">{error}</Text>
      )}
    </View>
  );
}

function FormTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  autoCapitalize = 'sentences',
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'numeric';
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
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        className={`h-14 rounded-2xl border bg-surface px-4 text-base text-foreground ${
          error ? 'border-error' : 'border-border'
        }`}
      />

      {error && (
        <Text className="mt-1 text-sm text-error">{error}</Text>
      )}
    </View>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="mt-3 text-muted">{label}</Text>
    </View>
  );
}

function LoadError() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <Text className="text-center text-base font-semibold text-error">
        Nije moguće učitati podatke o košnici.
      </Text>

      <Pressable
        onPress={() => {
          router.back();
        }}
        className="mt-5 rounded-2xl bg-primary px-5 py-3"
      >
        <Text className="font-bold text-background">Nazad</Text>
      </Pressable>
    </View>
  );
}
