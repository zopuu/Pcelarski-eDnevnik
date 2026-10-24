import { zodResolver } from '@hookform/resolvers/zod';
import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type UseFormSetError,
} from 'react-hook-form';
import { ActivityIndicator, Alert, Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import {
  EnumChoiceField,
  FormTextInput,
} from '@/features/hive-inspections/components/inspection-form-controls';
import { useHive } from '@/features/hives/hooks/use-hive';
import { useHives } from '@/features/hives/hooks/use-hives';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { ApiError } from '@/shared/api/api-error';
import { DatePickerField } from '@/shared/components/date-picker-field';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';
import { formatDateOnly } from '@/shared/utils/date-only';

import { useRecordPattyFeeding } from '../hooks/use-record-patty-feeding';
import {
  recordPattyFeedingSchema,
  type RecordPattyFeedingFormValues,
} from '../schemas/record-patty-feeding-schema';
import type { PattyType, RecordPattyFeedingRequest } from '../types/patty-feeding';

type RecordPattyFeedingScreenProps =
  | {
      apiaryId: string;
      hiveId?: never;
    }
  | {
      hiveId: string;
      apiaryId?: never;
    };

type SelectableHive = {
  id: string;
  label: string;
  identificationNumber: string | null;
};

const pattyTypeOptions: readonly {
  value: PattyType;
  label: string;
}[] = [
  { value: 'sugar', label: 'Šećerna' },
  { value: 'protein', label: 'Proteinska' },
  { value: 'honey', label: 'Medna' },
  { value: 'medicated', label: 'Sa lekom' },
  { value: 'invertSugar', label: 'Od invertnog šećera' },
  { value: 'other', label: 'Druga' },
];

const today = formatDateOnly(new Date());

export function RecordPattyFeedingScreen(props: RecordPattyFeedingScreenProps) {
  const { openDrawer } = useAppDrawer();
  const hiveId = props.hiveId ?? '';
  const apiaryId = props.apiaryId ?? '';
  const isSingleHive = hiveId.length > 0;
  const apiaryHivesQuery = useHives(apiaryId);
  const hiveQuery = useHive(hiveId);
  const mutation = useRecordPattyFeeding();
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<RecordPattyFeedingFormValues>({
    resolver: zodResolver(recordPattyFeedingSchema),
    defaultValues: {
      performedOn: today,
      pattyMassG: '',
      pattyType: 'protein',
      manufacturer: '',
      notes: '',
      hives: isSingleHive
        ? [
            {
              hiveId,
              percentage: '100',
            },
          ]
        : [],
    },
  });
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'hives',
  });
  const selectedHives = useWatch({
    control,
    name: 'hives',
  });
  const pattyMassG = useWatch({
    control,
    name: 'pattyMassG',
  });

  const selectableHives: SelectableHive[] = isSingleHive
    ? hiveQuery.data
      ? [hiveQuery.data]
      : []
    : (apiaryHivesQuery.data ?? []).filter((hive) => hive.status === 'active');

  useEffect(() => {
    if (!isSingleHive || !hiveQuery.data) {
      return;
    }

    if (selectedHives?.[0]?.hiveId === hiveId) {
      return;
    }

    replace([
      {
        hiveId,
        percentage: '100',
      },
    ]);
  }, [hiveId, hiveQuery.data, isSingleHive, replace, selectedHives]);

  const isLoadingHives = isSingleHive ? hiveQuery.isLoading : apiaryHivesQuery.isLoading;
  const hasHiveError = isSingleHive
    ? hiveQuery.isError || !hiveQuery.data
    : apiaryHivesQuery.isError || !apiaryHivesQuery.data;

  const toggleHive = (selectedHiveId: string) => {
    if (isSingleHive) {
      return;
    }

    const index = fields.findIndex((field) => field.hiveId === selectedHiveId);

    if (index >= 0) {
      remove(index);
      return;
    }

    append({
      hiveId: selectedHiveId,
      percentage: '100',
    });
  };

  const onSubmit = async (values: RecordPattyFeedingFormValues) => {
    clearErrors();

    try {
      const response = await mutation.mutateAsync(toRequest(values));
      Keyboard.dismiss();
      Alert.alert(
        'Prihrana je sačuvana',
        `Broj košnica: ${response.affectedHiveCount}\nUkupno dato: ${formatGrams(response.totalMassG)}`,
        [
          {
            text: 'U redu',
            onPress: () => {
              router.replace(isSingleHive ? `/hives/${hiveId}` : `/apiaries/${apiaryId}`);
            },
          },
        ],
      );
    } catch (error) {
      if (applyServerValidationErrors(error, setError)) {
        return;
      }

      Alert.alert('Prihrana nije sačuvana', getMutationErrorMessage(error));
    }
  };

  if (isLoadingHives) {
    return <LoadingState />;
  }

  if (hasHiveError) {
    return (
      <Screen header={<AppHeader onMenuPress={openDrawer} />}>
        <ErrorState
          onRetry={() => {
            if (isSingleHive) {
              void hiveQuery.refetch();
              return;
            }

            void apiaryHivesQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  const hivesError = typeof errors.hives?.message === 'string' ? errors.hives.message : undefined;

  return (
    <Screen header={<AppHeader onMenuPress={openDrawer} />}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 36,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vrati se nazad"
          onPress={() => router.back()}
          className="mb-3 min-h-11 self-start justify-center py-2"
        >
          <Text className="text-sm font-semibold text-primary">← Nazad</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-foreground">Prihrana pogačom</Text>
        <Text className="mt-1 text-sm leading-5 text-muted">
          Unesite podatke o jednoj pogači, a zatim procenat koji dajete svakoj košnici.
        </Text>

        <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Opšti podaci</Text>
        <View className="rounded-3xl border border-border bg-surface px-5 pb-1 pt-5">
          <Controller
            control={control}
            name="performedOn"
            render={({ field }) => (
              <DatePickerField
                label="Datum prihrane *"
                value={field.value}
                onChange={field.onChange}
                maximumDate={today}
                required
                error={errors.performedOn?.message}
              />
            )}
          />
          <PattyMassField control={control} error={errors.pattyMassG?.message} />
          <Controller
            control={control}
            name="pattyType"
            render={({ field }) => (
              <EnumChoiceField
                label="Vrsta pogače *"
                value={field.value}
                onChange={field.onChange}
                options={pattyTypeOptions}
                error={errors.pattyType?.message}
              />
            )}
          />
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
            name="notes"
            render={({ field }) => (
              <FormTextInput
                label="Napomena"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Dodatne informacije o prihrani"
                multiline
                error={errors.notes?.message}
              />
            )}
          />
        </View>

        <Text className="mb-2 mt-7 text-lg font-bold text-foreground">
          {isSingleHive ? 'Košnica za prihranu' : 'Košnice za prihranu'}
        </Text>
        <Text className="mb-4 text-sm leading-5 text-muted">
          {isSingleHive
            ? 'Prihrana će biti evidentirana samo za ovu košnicu.'
            : 'Izaberite košnice i za svaku unesite procenat pogače.'}{' '}
          100% je jedna cela pogača, a najviše možete uneti 300%.
        </Text>

        {selectableHives.length === 0 ? (
          <EmptyState />
        ) : isSingleHive ? (
          <HivePercentageCard
            hive={selectableHives[0]}
            selected
            selectionDisabled
            percentage={selectedHives?.[0]?.percentage ?? '100'}
            pattyMassG={pattyMassG}
            error={errors.hives?.[0]?.percentage?.message}
            onToggle={() => undefined}
            onPercentageChange={(value) => {
              setValue('hives.0.percentage', value, {
                shouldValidate: true,
              });
            }}
          />
        ) : (
          <View className="gap-3">
            {selectableHives.map((hive) => {
              const selectedIndex = fields.findIndex((field) => field.hiveId === hive.id);
              const selected = selectedIndex >= 0;

              return (
                <HivePercentageCard
                  key={hive.id}
                  hive={hive}
                  selected={selected}
                  selectionDisabled={false}
                  percentage={selectedHives?.[selectedIndex]?.percentage ?? ''}
                  pattyMassG={pattyMassG}
                  error={selected ? errors.hives?.[selectedIndex]?.percentage?.message : undefined}
                  onToggle={() => toggleHive(hive.id)}
                  onPercentageChange={(value) => {
                    if (selectedIndex < 0) {
                      return;
                    }

                    setValue(`hives.${selectedIndex}.percentage`, value, {
                      shouldValidate: true,
                    });
                  }}
                />
              );
            })}
          </View>
        )}

        {hivesError && <Text className="mt-2 text-sm text-error">{hivesError}</Text>}

        <View className="mt-7 gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Otkaži unos prihrane pogačom"
            disabled={mutation.isPending}
            onPress={() => router.back()}
            className={`min-h-13 items-center justify-center rounded-2xl border border-border bg-surface px-5 ${
              mutation.isPending ? 'opacity-60' : ''
            }`}
          >
            <Text className="text-base font-bold text-foreground">Otkaži</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sačuvaj prihranu pogačom"
            disabled={mutation.isPending || selectableHives.length === 0}
            onPress={() => {
              void handleSubmit(onSubmit)();
            }}
            className={`min-h-14 items-center justify-center rounded-2xl bg-primary px-5 ${
              mutation.isPending || selectableHives.length === 0 ? 'opacity-60' : ''
            }`}
          >
            {mutation.isPending ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color={colors.onPrimary} />
                <Text className="text-base font-bold text-white">Čuvanje...</Text>
              </View>
            ) : (
              <Text className="text-base font-bold text-white">Završi prihranu</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

function PattyMassField({
  control,
  error,
}: {
  control: Control<RecordPattyFeedingFormValues>;
  error?: string;
}) {
  return (
    <Controller
      control={control}
      name="pattyMassG"
      render={({ field }) => (
        <View className="mb-5">
          <Text className="mb-2 text-sm font-semibold text-foreground">
            Masa jedne pogače (g) *
          </Text>
          <TextInput
            accessibilityLabel="Masa jedne pogače u gramima"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="Na primer 500"
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            keyboardType="number-pad"
            inputMode="numeric"
            className={`h-14 rounded-2xl border bg-background px-4 text-base text-foreground ${
              error ? 'border-error' : 'border-border'
            }`}
          />
          {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
        </View>
      )}
    />
  );
}

function HivePercentageCard({
  hive,
  selected,
  selectionDisabled,
  percentage,
  pattyMassG,
  error,
  onToggle,
  onPercentageChange,
}: {
  hive: SelectableHive;
  selected: boolean;
  selectionDisabled: boolean;
  percentage: string;
  pattyMassG: string;
  error?: string;
  onToggle: () => void;
  onPercentageChange: (value: string) => void;
}) {
  return (
    <View
      className={`overflow-hidden rounded-3xl border bg-surface ${
        selected ? 'border-primary' : 'border-border'
      }`}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected, disabled: selectionDisabled }}
        accessibilityLabel={`${selected ? 'Odznači' : 'Označi'} košnicu ${hive.label}`}
        disabled={selectionDisabled}
        onPress={onToggle}
        className="min-h-20 flex-row items-center px-4 py-3"
      >
        <View
          className={`h-7 w-7 items-center justify-center rounded-full border ${
            selected ? 'border-primary bg-primary' : 'border-border bg-surface'
          }`}
        >
          {selected && <Ionicons name="checkmark" size={18} color={colors.onPrimary} />}
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-bold text-foreground">{hive.label}</Text>
          {hive.identificationNumber && (
            <Text className="mt-1 text-sm text-muted">Oznaka: {hive.identificationNumber}</Text>
          )}
        </View>
      </Pressable>

      {selected && (
        <View className="border-t border-border bg-surface-warm px-4 pb-4 pt-3">
          <Text className="mb-2 text-sm font-semibold text-foreground">Procenat pogače (%) *</Text>
          <TextInput
            accessibilityLabel={`Procenat pogače za košnicu ${hive.label}`}
            value={percentage}
            onChangeText={onPercentageChange}
            placeholder="100"
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            keyboardType="decimal-pad"
            inputMode="decimal"
            className={`h-12 rounded-xl border bg-background px-4 text-base text-foreground ${
              error ? 'border-error' : 'border-border'
            }`}
          />
          {error ? (
            <Text className="mt-1 text-xs text-error">{error}</Text>
          ) : (
            <Text className="mt-2 text-xs text-muted">
              Količina: {formatGrams(calculateMass(pattyMassG, percentage))}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function toRequest(values: RecordPattyFeedingFormValues): RecordPattyFeedingRequest {
  return {
    performedAt: toPerformedAt(values.performedOn),
    pattyMassG: Number(values.pattyMassG),
    pattyType: values.pattyType,
    manufacturer: optionalText(values.manufacturer),
    notes: optionalText(values.notes),
    imageUrl: null,
    hives: values.hives.map((hive) => ({
      hiveId: hive.hiveId,
      percentage: parseDecimal(hive.percentage),
    })),
  };
}

function toPerformedAt(performedOn: string) {
  if (performedOn === today) {
    return new Date().toISOString();
  }

  const [year, month, day] = performedOn.split('-').map(Number);

  return new Date(year, month - 1, day, 12, 0).toISOString();
}

function optionalText(value: string) {
  const normalized = value.trim();

  return normalized || null;
}

function parseDecimal(value: string) {
  return Number(value.replace(',', '.'));
}

function calculateMass(pattyMassG: string, percentage: string) {
  const baseMass = Number(pattyMassG);
  const parsedPercentage = parseDecimal(percentage);

  if (
    !Number.isFinite(baseMass) ||
    baseMass <= 0 ||
    !Number.isFinite(parsedPercentage) ||
    parsedPercentage <= 0 ||
    parsedPercentage > 300
  ) {
    return 0;
  }

  return Math.round((baseMass * parsedPercentage) / 100);
}

function formatGrams(value: number) {
  return `${new Intl.NumberFormat('sr-Latn-RS').format(value)} g`;
}

function applyServerValidationErrors(
  error: unknown,
  setError: UseFormSetError<RecordPattyFeedingFormValues>,
) {
  if (!(error instanceof ApiError) || !error.problem?.errors) {
    return false;
  }

  const fieldMap: Record<string, keyof RecordPattyFeedingFormValues> = {
    performedAt: 'performedOn',
    pattyMassG: 'pattyMassG',
    pattyType: 'pattyType',
    manufacturer: 'manufacturer',
    notes: 'notes',
    hives: 'hives',
  };
  let hasFieldError = false;

  Object.entries(error.problem.errors).forEach(([key, messages]) => {
    const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);
    const field = fieldMap[normalizedKey];

    if (!field || !messages[0]) {
      return;
    }

    setError(field, {
      type: 'server',
      message: messages[0],
    });
    hasFieldError = true;
  });

  return hasFieldError;
}

function getMutationErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 404) {
    return 'Jedna ili više košnica nije pronađena ili joj više nemate pristup.';
  }

  if (error instanceof ApiError && error.status === 409) {
    return 'Podaci o jednoj od košnica su se promenili. Osvežite podatke i pokušajte ponovo.';
  }

  if (error instanceof ApiError && error.status === 400) {
    return 'Proverite označena polja i pokušajte ponovo.';
  }

  return error instanceof Error
    ? error.message
    : 'Prihranu nije moguće sačuvati. Pokušajte ponovo.';
}

function LoadingState() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-3 text-muted">Učitavanje košnica...</Text>
      </View>
    </Screen>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-base font-semibold text-error">
        Nije moguće učitati košnice za prihranu.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-primary px-5"
      >
        <Text className="font-bold text-background">Pokušaj ponovo</Text>
      </Pressable>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="rounded-3xl border border-border bg-surface px-6 py-8">
      <Text className="text-center text-base font-semibold text-foreground">
        Nema dostupnih aktivnih košnica.
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-muted">
        Prihrana se može evidentirati samo za aktivnu košnicu.
      </Text>
    </View>
  );
}
