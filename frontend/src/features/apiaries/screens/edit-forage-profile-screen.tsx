import Ionicons from '@react-native-vector-icons/ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { useCurrentForageProfile } from '../hooks/use-current-forage-profile';
import { useUpdateForageProfile } from '../hooks/use-update-forage-profile';
import {
  createForageProfileItemSchema,
  createForageProfileSchema,
  type CreateForageProfileFormInput,
  type CreateForageProfileFormValues,
  type CreateForageProfileItemFormInput,
  type CreateForageProfileItemFormValues,
  type SelectableForageType,
} from '../schemas/create-forage-profile-schema';
import type { UpdateForageProfileRequest } from '../types/forage-profile';

import { ApiError } from '@/shared/api/api-error';
import { colors } from '@/shared/theme/colors';

type EditForageProfileScreenProps = {
  apiaryId: string;
  forageProfileId: string;
  year: number;
};

type ForageTypeOption = {
  value: SelectableForageType;
  label: string;
};

type ActiveItemEditor = { mode: 'add' } | { mode: 'edit'; index: number } | null;

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

const forageTypeLabels = Object.fromEntries(
  forageTypeOptions.map((option) => [option.value, option.label]),
) as Record<SelectableForageType, string>;

const emptyItem: CreateForageProfileItemFormInput = {
  forageType: null,
  percentage: '',
  intensity: 3,
  notes: '',
};

function optionalText(value: string): string | null {
  return value.trim() || null;
}

function getTotalPercentage(items: CreateForageProfileFormInput['items']) {
  const total = items.reduce((sum, item) => {
    const percentage = Number(item.percentage.replace(',', '.'));
    return Number.isFinite(percentage) ? sum + percentage : sum;
  }, 0);

  return Math.round((total + Number.EPSILON) * 100) / 100;
}

function getUpdateErrorMessage(error: unknown) {
  if (
    error instanceof ApiError &&
    error.problem?.code === 'forage_profiles.current_stay_year_already_has_profile'
  ) {
    return 'Profil paše za izabranu godinu već postoji.';
  }

  return 'Profil paše nije moguće sačuvati. Pokušajte ponovo.';
}

export function EditForageProfileScreen({
  apiaryId,
  forageProfileId,
  year,
}: EditForageProfileScreenProps) {
  const profileQuery = useCurrentForageProfile(apiaryId, year);
  const updateMutation = useUpdateForageProfile(apiaryId);
  const [activeItemEditor, setActiveItemEditor] = useState<ActiveItemEditor>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateForageProfileFormInput, unknown, CreateForageProfileFormValues>({
    resolver: zodResolver(createForageProfileSchema),
    defaultValues: {
      year: String(year),
      radiusKm: '',
      name: '',
      notes: '',
      items: [],
    },
  });
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items',
  });
  const items = useWatch({ control, name: 'items' });

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile || profile.id !== forageProfileId) {
      return;
    }

    reset({
      year: String(profile.year),
      radiusKm: profile.radiusKm === null ? '' : String(profile.radiusKm),
      name: profile.name,
      notes: profile.notes ?? '',
      items: profile.items
        .filter((item) => item.forageType !== 'other')
        .map((item) => ({
          forageType: item.forageType as SelectableForageType,
          percentage: String(item.percentage),
          intensity: item.intensity,
          notes: item.notes ?? '',
        })),
    });
  }, [forageProfileId, profileQuery.data, reset]);

  const editingIndex = activeItemEditor?.mode === 'edit' ? activeItemEditor.index : null;
  const selectedForageTypes = new Set(
    items
      .filter((_, index) => index !== editingIndex)
      .map((item) => item.forageType)
      .filter((value): value is SelectableForageType => value !== null),
  );
  const totalPercentage = getTotalPercentage(items);
  const isTotalOverLimit = totalPercentage > 100;
  const missingPercentage = Math.max(0, 100 - totalPercentage);
  const sortedItems = items
    .map((item, index) => ({ item, index }))
    .sort((first, second) => {
      const firstPercentage = Number(first.item.percentage.replace(',', '.'));
      const secondPercentage = Number(second.item.percentage.replace(',', '.'));
      return secondPercentage - firstPercentage;
    });
  const canAddItem = items.length < forageTypeOptions.length;

  const onSubmit = async (values: CreateForageProfileFormValues) => {
    const request: UpdateForageProfileRequest = {
      year: values.year,
      radiusKm: values.radiusKm,
      name: values.name,
      notes: optionalText(values.notes),
      items: values.items.map((item) => ({
        forageType: item.forageType,
        percentage: item.percentage,
        intensity: item.intensity,
        notes: optionalText(item.notes),
      })),
    };

    try {
      await updateMutation.mutateAsync({ forageProfileId, request });
      router.replace({
        pathname: '/apiaries/[apiaryId]/forage-profiles',
        params: { apiaryId },
      } as never);
    } catch {
      // The recoverable mutation error is shown below the form.
    }
  };

  if (profileQuery.isLoading) {
    return <LoadingState label="Učitavanje profila paše..." />;
  }

  if (profileQuery.isError || profileQuery.data?.id !== forageProfileId) {
    return <LoadError />;
  }

  const activeItem = editingIndex === null ? emptyItem : items[editingIndex];

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        <Pressable onPress={() => router.back()} className="mb-5 self-start py-2">
          <Text className="text-base font-semibold text-primary">← Nazad</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-foreground">Izmeni profil paše</Text>
        <Text className="mt-1 text-sm text-muted">
          Izmenite podatke i zastupljenost vrsta paše.
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
            <Text className="text-lg font-bold text-foreground">Vrste paše</Text>
            <Text className="mt-1 text-sm text-muted">
              Izmenite postojeće stavke ili dodajte novu vrstu.
            </Text>
          </View>
          <View
            className={`rounded-full px-3 py-1.5 ${isTotalOverLimit ? 'bg-error/10' : 'bg-primary/10'}`}
          >
            <Text
              className={`text-xs font-bold ${isTotalOverLimit ? 'text-error' : 'text-primary'}`}
            >
              {totalPercentage.toFixed(2)}%
            </Text>
          </View>
        </View>

        {isTotalOverLimit && (
          <View className="mb-4 rounded-2xl border border-error/30 bg-error/10 px-4 py-3">
            <Text className="font-semibold text-error">
              Ukupno je {totalPercentage.toFixed(2)}%.
            </Text>
            <Text className="mt-1 text-sm text-error">
              Zbir procenata mora biti najviše 100%. Sačuvavanje je onemogućeno dok ne ispravite
              stavke.
            </Text>
          </View>
        )}

        <View className="mb-4 overflow-hidden rounded-3xl border border-border bg-surface">
          {sortedItems.map(({ item, index }, sortedIndex) => {
            if (!item.forageType) {
              return null;
            }
            if (editingIndex === index) {
              return (
                <ForageItemEditor
                  key={`edit-${fields[index]?.id ?? index}`}
                  initialItem={item}
                  selectedForageTypes={selectedForageTypes}
                  title="Izmeni vrstu paše"
                  confirmLabel="Sačuvaj stavku"
                  onCancel={() => setActiveItemEditor(null)}
                  onConfirm={(updatedItem) => {
                    update(index, updatedItem);
                    setActiveItemEditor(null);
                  }}
                />
              );
            }
            return (
              <ReadOnlyForageItem
                key={fields[index]?.id ?? index}
                forageType={item.forageType}
                percentage={item.percentage}
                intensity={item.intensity}
                notes={item.notes}
                isLast={sortedIndex === sortedItems.length - 1}
                onEdit={() => setActiveItemEditor({ mode: 'edit', index })}
                onDelete={() => remove(index)}
              />
            );
          })}
          {missingPercentage > 0 && <AutomaticOtherItem percentage={missingPercentage} />}
        </View>

        {activeItemEditor?.mode === 'add' ? (
          <ForageItemEditor
            key="add"
            initialItem={activeItem}
            selectedForageTypes={selectedForageTypes}
            title="Dodaj vrstu paše"
            confirmLabel="Dodaj stavku"
            onCancel={() => setActiveItemEditor(null)}
            onConfirm={(newItem) => {
              append(newItem);
              setActiveItemEditor(null);
            }}
          />
        ) : (
          <Pressable
            disabled={!canAddItem || activeItemEditor !== null}
            onPress={() => setActiveItemEditor({ mode: 'add' })}
            className={`mb-4 min-h-14 items-center justify-center rounded-2xl border border-primary bg-surface px-5 ${!canAddItem ? 'opacity-50' : ''}`}
          >
            <Text className="text-base font-bold text-primary">+ Dodaj vrstu paše</Text>
          </Pressable>
        )}

        {errors.items?.message && !isTotalOverLimit && (
          <Text className="mb-3 text-sm text-error">{errors.items.message}</Text>
        )}
        {updateMutation.isError && (
          <View className="mb-4 rounded-2xl border border-error/30 bg-surface px-4 py-3">
            <Text className="text-sm text-error">
              {getUpdateErrorMessage(updateMutation.error)}
            </Text>
          </View>
        )}
        <Pressable
          disabled={
            updateMutation.isPending || isTotalOverLimit || !isDirty || activeItemEditor !== null
          }
          onPress={handleSubmit(onSubmit)}
          className={`min-h-14 items-center justify-center rounded-2xl bg-primary px-5 ${updateMutation.isPending || isTotalOverLimit || !isDirty || activeItemEditor !== null ? 'opacity-50' : ''}`}
        >
          <Text className="text-base font-bold text-background">
            {updateMutation.isPending ? 'Čuvanje...' : 'Sačuvaj izmene'}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

function ForageItemEditor({
  initialItem,
  selectedForageTypes,
  title,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  initialItem: CreateForageProfileItemFormInput;
  selectedForageTypes: Set<SelectableForageType>;
  title: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: (item: CreateForageProfileItemFormInput) => void;
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateForageProfileItemFormInput, unknown, CreateForageProfileItemFormValues>({
    resolver: zodResolver(createForageProfileItemSchema),
    defaultValues: initialItem,
  });
  return (
    <View className="mb-4 rounded-3xl border border-primary/30 bg-surface p-4">
      <Text className="text-base font-bold text-foreground">{title}</Text>
      <Controller
        control={control}
        name="forageType"
        render={({ field }) => (
          <ForageTypePicker
            value={field.value}
            onChange={field.onChange}
            selectedForageTypes={selectedForageTypes}
            error={errors.forageType?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="percentage"
        render={({ field }) => (
          <FormTextInput
            label="Zastupljenost (%) *"
            value={field.value}
            onChangeText={field.onChange}
            keyboardType="decimal-pad"
            error={errors.percentage?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="intensity"
        render={({ field }) => <IntensityPicker value={field.value} onChange={field.onChange} />}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <FormTextInput
            label="Napomena"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="Opcionalno"
            multiline
            error={errors.notes?.message}
          />
        )}
      />
      <View className="flex-row gap-3">
        <Pressable
          onPress={onCancel}
          className="min-h-14 flex-1 items-center justify-center rounded-2xl border border-border bg-background px-4"
        >
          <Text className="font-bold text-foreground">Otkaži</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit((item) =>
            onConfirm({
              forageType: item.forageType,
              percentage: String(item.percentage),
              intensity: item.intensity,
              notes: item.notes,
            }),
          )}
          className="min-h-14 flex-1 items-center justify-center rounded-2xl bg-primary px-4"
        >
          <Text className="font-bold text-background">{confirmLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ReadOnlyForageItem({
  forageType,
  percentage,
  intensity,
  notes,
  isLast,
  onEdit,
  onDelete,
}: {
  forageType: SelectableForageType;
  percentage: string;
  intensity: number;
  notes: string;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View className={`px-4 py-4 ${isLast ? '' : 'border-b border-border'}`}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">
            {forageTypeLabels[forageType]}
          </Text>
          <Text className="mt-1 text-sm text-muted">Jačina: {intensity}/5</Text>
          {notes && <Text className="mt-1 text-sm text-muted">{notes}</Text>}
        </View>
        <Text className="text-base font-bold text-primary">{percentage}%</Text>
      </View>
      <View className="mt-3 flex-row gap-2">
        <Pressable
          onPress={onEdit}
          className="min-h-10 flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-border bg-background px-3"
        >
          <Ionicons name="create-outline" size={17} color={colors.primary} />
          <Text className="font-semibold text-primary">Izmeni</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          className="min-h-10 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-error/10 px-3"
        >
          <Ionicons name="trash-outline" size={17} color={colors.error} />
          <Text className="font-semibold text-error">Obriši</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AutomaticOtherItem({ percentage }: { percentage: number }) {
  return (
    <View className="border-t border-border px-4 py-4">
      <View className="flex-row items-center justify-between gap-3">
        <View>
          <Text className="text-base font-bold text-foreground">Ostalo</Text>
          <Text className="mt-1 text-sm text-muted">Automatski izračunato</Text>
        </View>
        <Text className="text-base font-bold text-primary">{percentage.toFixed(2)}%</Text>
      </View>
    </View>
  );
}

function ForageTypePicker({
  value,
  onChange,
  selectedForageTypes,
  error,
}: {
  value: SelectableForageType | null;
  onChange: (value: SelectableForageType) => void;
  selectedForageTypes: Set<SelectableForageType>;
  error?: string;
}) {
  return (
    <View className="mb-4 mt-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">Vrsta *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {forageTypeOptions.map((option) => {
          const isSelected = value === option.value;
          const isAlreadyAdded = selectedForageTypes.has(option.value);
          return (
            <Pressable
              key={option.value}
              disabled={isAlreadyAdded}
              onPress={() => onChange(option.value)}
              className={`min-h-11 items-center justify-center rounded-xl border px-3 ${isSelected ? 'border-primary bg-primary' : 'border-border bg-background'} ${isAlreadyAdded ? 'opacity-40' : ''}`}
            >
              <Text
                className={`text-sm font-semibold ${isSelected ? 'text-background' : 'text-foreground'}`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
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
      <Text className="mb-2 text-sm font-semibold text-foreground">Jačina paše *</Text>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((intensity) => {
          const isSelected = value === intensity;
          return (
            <Pressable
              key={intensity}
              onPress={() => onChange(intensity)}
              className={`min-h-12 flex-1 items-center justify-center rounded-xl border ${isSelected ? 'border-primary bg-primary' : 'border-border bg-background'}`}
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
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={`${multiline ? 'min-h-28 py-3' : 'h-14'} rounded-2xl border bg-surface px-4 text-base text-foreground ${error ? 'border-error' : 'border-border'}`}
      />
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
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
        Nije moguće učitati profil paše.
      </Text>
      <Pressable onPress={() => router.back()} className="mt-5 rounded-2xl bg-primary px-5 py-3">
        <Text className="font-bold text-background">Nazad</Text>
      </Pressable>
    </View>
  );
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text className="mb-3 mt-8 text-lg font-bold text-foreground">{children}</Text>;
}
