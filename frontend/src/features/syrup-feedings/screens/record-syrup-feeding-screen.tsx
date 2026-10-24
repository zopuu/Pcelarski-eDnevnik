import { zodResolver } from '@hookform/resolvers/zod';
import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type UseFormSetError,
} from 'react-hook-form';
import { ActivityIndicator, Alert, Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { FormTextInput } from '@/features/hive-inspections/components/inspection-form-controls';
import { useHive } from '@/features/hives/hooks/use-hive';
import { useHives } from '@/features/hives/hooks/use-hives';
import { useHiveStayHistory } from '@/features/hives/hooks/use-hive-stay-history';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { ApiError } from '@/shared/api/api-error';
import { DatePickerField } from '@/shared/components/date-picker-field';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';
import { formatDateOnly } from '@/shared/utils/date-only';

import { SyrupFeedingResultModal } from '../components/syrup-feeding-result-modal';
import { useRecordSyrupFeeding } from '../hooks/use-record-syrup-feeding';
import { useSyrupFeedingOptions } from '../hooks/use-syrup-feeding-options';
import {
  recordSyrupFeedingSchema,
  type RecordSyrupFeedingFormValues,
} from '../schemas/record-syrup-feeding-schema';
import type {
  RecordSyrupFeedingRequest,
  RecordSyrupFeedingResponse,
  SyrupFeedingHiveOption,
} from '../types/syrup-feeding';

type RecordSyrupFeedingScreenProps =
  | {
      apiaryId: string;
      hiveId?: never;
    }
  | {
      hiveId: string;
      apiaryId?: never;
    };

type EligibleHive = SyrupFeedingHiveOption & {
  label: string;
};

const today = formatDateOnly(new Date());

export function RecordSyrupFeedingScreen(props: RecordSyrupFeedingScreenProps) {
  const { openDrawer } = useAppDrawer();
  const isSingleHive = 'hiveId' in props;
  const hiveId = props.hiveId ?? '';
  const apiaryIdFromRoute = props.apiaryId ?? '';
  const hiveQuery = useHive(hiveId);
  const hiveStaysQuery = useHiveStayHistory(hiveId);
  const activeHiveStay = hiveStaysQuery.data?.pages
    .flatMap((page) => page.items)
    .find((stay) => stay.isActive);
  const apiaryId = apiaryIdFromRoute || activeHiveStay?.apiaryId || '';
  const apiaryHivesQuery = useHives(isSingleHive ? '' : apiaryId);
  const feedingOptionsQuery = useSyrupFeedingOptions(apiaryId);
  const mutation = useRecordSyrupFeeding();
  const [result, setResult] = useState<RecordSyrupFeedingResponse | null>(null);
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<RecordSyrupFeedingFormValues>({
    resolver: zodResolver(recordSyrupFeedingSchema),
    defaultValues: {
      performedOn: today,
      sugarParts: '1',
      waterParts: '1',
      additives: '',
      notes: '',
      hives: [],
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

  const eligibleHives = useMemo<EligibleHive[]>(() => {
    const options = feedingOptionsQuery.data ?? [];

    if (isSingleHive) {
      const option = options.find((item) => item.hiveId === hiveId);

      if (!option) {
        return [];
      }

      return [
        {
          ...option,
          label: hiveQuery.data?.label ?? 'Ova košnica',
        },
      ];
    }

    const hivesById = new Map((apiaryHivesQuery.data ?? []).map((hive) => [hive.id, hive]));

    return options.map((option) => ({
      ...option,
      label: hivesById.get(option.hiveId)?.label ?? 'Košnica',
    }));
  }, [
    apiaryHivesQuery.data,
    feedingOptionsQuery.data,
    hiveId,
    hiveQuery.data?.label,
    isSingleHive,
  ]);

  useEffect(() => {
    if (!isSingleHive || eligibleHives.length !== 1) {
      return;
    }

    if (selectedHives?.[0]?.hiveId === hiveId) {
      return;
    }

    replace([
      {
        hiveId,
        fillPercentage: '100',
      },
    ]);
  }, [eligibleHives.length, hiveId, isSingleHive, replace, selectedHives]);

  const isLoading =
    (isSingleHive && (hiveQuery.isLoading || hiveStaysQuery.isLoading)) ||
    feedingOptionsQuery.isLoading ||
    (!isSingleHive && apiaryHivesQuery.isLoading);
  const hasLoadingError =
    (isSingleHive && (hiveQuery.isError || hiveStaysQuery.isError)) ||
    feedingOptionsQuery.isError ||
    (!isSingleHive && apiaryHivesQuery.isError);
  const isHiveOutsideAnApiary = isSingleHive && !hiveStaysQuery.isLoading && !activeHiveStay;
  const hivesError = getHivesError(errors);
  const labelsByHiveId = Object.fromEntries(eligibleHives.map((hive) => [hive.hiveId, hive.label]));

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
      fillPercentage: '100',
    });
  };

  const onSubmit = async (values: RecordSyrupFeedingFormValues) => {
    clearErrors();

    try {
      const response = await mutation.mutateAsync(toRequest(values));
      Keyboard.dismiss();
      setResult(response);
    } catch (error) {
      if (applyServerValidationErrors(error, setError)) {
        return;
      }

      Alert.alert('Prihrana nije sačuvana', getMutationErrorMessage(error));
    }
  };

  const handleResultDone = () => {
    setResult(null);
    router.replace(isSingleHive ? `/hives/${hiveId}` : `/apiaries/${apiaryId}`);
  };

  if (isLoading) {
    return <LoadingState label="Učitavanje košnica za prihranu..." />;
  }

  if (hasLoadingError) {
    return (
      <Screen header={<AppHeader onMenuPress={openDrawer} />}>
        <ErrorState
          onRetry={() => {
            void feedingOptionsQuery.refetch();

            if (isSingleHive) {
              void hiveQuery.refetch();
              void hiveStaysQuery.refetch();
              return;
            }

            void apiaryHivesQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  return (
    <>
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

          <Text className="text-2xl font-bold text-foreground">Prihrana sirupom</Text>
          <Text className="mt-1 text-sm leading-5 text-muted">
            Unesite odnos sastojaka, a zatim količinu za svaku izabranu košnicu.
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
            <View className="mb-5 flex-row gap-3">
              <DecimalField
                control={control}
                name="sugarParts"
                label="Delovi šećera *"
                error={errors.sugarParts?.message}
              />
              <DecimalField
                control={control}
                name="waterParts"
                label="Delovi vode *"
                error={errors.waterParts?.message}
              />
            </View>
            <Controller
              control={control}
              name="additives"
              render={({ field }) => (
                <FormTextInput
                  label="Dodaci"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Na primer vitaminski dodatak"
                  error={errors.additives?.message}
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
              ? 'Ova košnica mora imati aktivnu hranilicu sa važećim kapacitetom.'
              : 'Prikazane su samo košnice sa aktivnom hranilicom. Za svaku izaberite procenat punjenja.'}
          </Text>

          {isHiveOutsideAnApiary ? (
            <EmptyState
              title="Košnica trenutno nije u pčelinjaku"
              description="Prihranu je moguće evidentirati samo za košnicu koja trenutno boravi u pčelinjaku."
            />
          ) : eligibleHives.length === 0 ? (
            <EmptyState
              title="Nema košnica sa hranilicom"
              description="Dodajte hranilicu i njen kapacitet u podacima o košnici, pa pokušajte ponovo."
            />
          ) : isSingleHive ? (
            <SingleHiveFeedingInput
              hive={eligibleHives[0]}
              fillPercentage={selectedHives?.[0]?.fillPercentage ?? ''}
              error={errors.hives?.[0]?.fillPercentage?.message}
              onFillPercentageChange={(value) => {
                setValue('hives.0.fillPercentage', value, {
                  shouldValidate: true,
                });
              }}
            />
          ) : (
            <View className="gap-3">
              {eligibleHives.map((hive) => {
                const selectedIndex = fields.findIndex((field) => field.hiveId === hive.hiveId);
                const isSelected = selectedIndex >= 0;
                const selectedHive = selectedHives?.[selectedIndex];

                return (
                  <FeedingHiveCard
                    key={hive.hiveId}
                    hive={hive}
                    isSingleHive={isSingleHive}
                    selected={isSelected}
                    fillPercentage={selectedHive?.fillPercentage ?? ''}
                    error={
                      isSelected
                        ? errors.hives?.[selectedIndex]?.fillPercentage?.message
                        : undefined
                    }
                    onToggle={() => toggleHive(hive.hiveId)}
                    onFillPercentageChange={(value) => {
                      if (selectedIndex < 0) {
                        return;
                      }

                      setValue(`hives.${selectedIndex}.fillPercentage`, value, {
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
              accessibilityLabel="Otkaži unos prihrane sirupom"
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
              accessibilityLabel="Sačuvaj prihranu sirupom"
              disabled={mutation.isPending || eligibleHives.length === 0}
              onPress={() => {
                void handleSubmit(onSubmit)();
              }}
              className={`min-h-14 items-center justify-center rounded-2xl bg-primary px-5 ${
                mutation.isPending || eligibleHives.length === 0 ? 'opacity-60' : ''
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

      <SyrupFeedingResultModal
        result={result}
        hiveLabels={labelsByHiveId}
        onDone={handleResultDone}
      />
    </>
  );
}

function DecimalField({
  control,
  name,
  label,
  error,
}: {
  control: ReturnType<typeof useForm<RecordSyrupFeedingFormValues>>['control'];
  name: 'sugarParts' | 'waterParts';
  label: string;
  error?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <View className="flex-1">
          <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>
          <TextInput
            accessibilityLabel={label}
            value={field.value}
            onChangeText={field.onChange}
            placeholder="1"
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            keyboardType="decimal-pad"
            inputMode="decimal"
            className={`h-14 rounded-2xl border bg-background px-4 text-base text-foreground ${
              error ? 'border-error' : 'border-border'
            }`}
          />
          {error && <Text className="mt-1 text-xs text-error">{error}</Text>}
        </View>
      )}
    />
  );
}

function FeedingHiveCard({
  hive,
  isSingleHive,
  selected,
  fillPercentage,
  error,
  onToggle,
  onFillPercentageChange,
}: {
  hive: EligibleHive;
  isSingleHive: boolean;
  selected: boolean;
  fillPercentage: string;
  error?: string;
  onToggle: () => void;
  onFillPercentageChange: (value: string) => void;
}) {
  return (
    <View
      className={`overflow-hidden rounded-3xl border bg-surface ${selected ? 'border-primary' : 'border-border'}`}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected, disabled: isSingleHive }}
        accessibilityLabel={`${selected ? 'Odznači' : 'Označi'} košnicu ${hive.label}`}
        disabled={isSingleHive}
        onPress={onToggle}
        className="min-h-20 flex-row items-center px-4 py-3"
      >
        <View
          className={`h-7 w-7 items-center justify-center rounded-full border ${selected ? 'border-primary bg-primary' : 'border-border bg-surface'}`}
        >
          {selected && <Ionicons name="checkmark" size={18} color={colors.onPrimary} />}
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-bold text-foreground">{hive.label}</Text>
          <Text className="mt-1 text-sm text-muted">
            Kapacitet hranilice: {formatMilliliters(hive.feederCapacityMl)}
          </Text>
        </View>
        {!isSingleHive && <Ionicons name="chevron-forward" size={20} color={colors.muted} />}
      </Pressable>

      {selected && (
        <View className="border-t border-border bg-surface-warm px-4 pb-4 pt-3">
          <Text className="mb-2 text-sm font-semibold text-foreground">
            Punjenje hranilice (%) *
          </Text>
          <TextInput
            accessibilityLabel={`Procenat punjenja za košnicu ${hive.label}`}
            value={fillPercentage}
            onChangeText={onFillPercentageChange}
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
              Izračunato:{' '}
              {formatMilliliters(calculatePreview(hive.feederCapacityMl, fillPercentage))}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function SingleHiveFeedingInput({
  hive,
  fillPercentage,
  error,
  onFillPercentageChange,
}: {
  hive: EligibleHive;
  fillPercentage: string;
  error?: string;
  onFillPercentageChange: (value: string) => void;
}) {
  return (
    <View className="overflow-hidden rounded-3xl border border-primary bg-surface">
      <View className="px-4 py-4">
        <Text className="text-base font-bold text-foreground">{hive.label}</Text>
        <Text className="mt-1 text-sm text-muted">
          Kapacitet hranilice: {formatMilliliters(hive.feederCapacityMl)}
        </Text>
      </View>
      <View className="border-t border-border bg-surface-warm px-4 pb-4 pt-3">
        <Text className="mb-2 text-sm font-semibold text-foreground">Punjenje hranilice (%) *</Text>
        <TextInput
          accessibilityLabel={`Procenat punjenja za košnicu ${hive.label}`}
          value={fillPercentage}
          onChangeText={onFillPercentageChange}
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
            Izračunato: {formatMilliliters(calculatePreview(hive.feederCapacityMl, fillPercentage))}
          </Text>
        )}
      </View>
    </View>
  );
}

function toRequest(values: RecordSyrupFeedingFormValues): RecordSyrupFeedingRequest {
  return {
    performedAt: toPerformedAt(values.performedOn),
    sugarParts: parseDecimal(values.sugarParts),
    waterParts: parseDecimal(values.waterParts),
    additives: optionalText(values.additives),
    notes: optionalText(values.notes),
    imageUrl: null,
    hives: values.hives.map((hive) => ({
      hiveId: hive.hiveId,
      fillPercentage: parseDecimal(hive.fillPercentage),
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

function parseDecimal(value: string) {
  return Number(value.replace(',', '.'));
}

function optionalText(value: string) {
  const normalized = value.trim();

  return normalized || null;
}

function calculatePreview(feederCapacityMl: number, fillPercentage: string) {
  const percentage = parseDecimal(fillPercentage);

  if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
    return 0;
  }

  return Math.round((feederCapacityMl * percentage) / 100);
}

function formatMilliliters(value: number) {
  return `${new Intl.NumberFormat('sr-RS').format(value)} ml`;
}

function getHivesError(
  errors: ReturnType<typeof useForm<RecordSyrupFeedingFormValues>>['formState']['errors'],
) {
  const message = errors.hives?.message;

  return typeof message === 'string' ? message : undefined;
}

function applyServerValidationErrors(
  error: unknown,
  setError: UseFormSetError<RecordSyrupFeedingFormValues>,
) {
  if (!(error instanceof ApiError) || !error.problem?.errors) {
    return false;
  }

  const fieldMap: Record<string, keyof RecordSyrupFeedingFormValues> = {
    performedAt: 'performedOn',
    sugarParts: 'sugarParts',
    waterParts: 'waterParts',
    additives: 'additives',
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
    return 'Jedna ili više izabranih košnica više nema važeću hranilicu. Osvežite podatke i pokušajte ponovo.';
  }

  if (error instanceof ApiError && error.status === 400) {
    return 'Proverite označena polja i pokušajte ponovo.';
  }

  return error instanceof Error
    ? error.message
    : 'Prihranu nije moguće sačuvati. Pokušajte ponovo.';
}

function LoadingState({ label }: { label: string }) {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-3 text-muted">{label}</Text>
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

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View className="rounded-3xl border border-border bg-surface px-6 py-8">
      <Text className="text-center text-base font-semibold text-foreground">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-muted">{description}</Text>
    </View>
  );
}
