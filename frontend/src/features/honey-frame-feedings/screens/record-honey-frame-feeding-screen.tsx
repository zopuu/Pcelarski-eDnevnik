import { zodResolver } from '@hookform/resolvers/zod';
import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type UseFormSetError,
} from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { FormTextInput } from '@/features/hive-inspections/components/inspection-form-controls';
import { useHive } from '@/features/hives/hooks/use-hive';
import { useHives } from '@/features/hives/hooks/use-hives';
import type { HiveListItem } from '@/features/hives/types/hive-list-item';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { ApiError } from '@/shared/api/api-error';
import { DatePickerField } from '@/shared/components/date-picker-field';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';
import { formatDateOnly } from '@/shared/utils/date-only';

import { useRecordHoneyFrameFeeding } from '../hooks/use-record-honey-frame-feeding';
import {
  recordHoneyFrameFeedingSchema,
  type RecordHoneyFrameFeedingFormValues,
} from '../schemas/record-honey-frame-feeding-schema';
import type {
  RecordHoneyFrameFeedingRequest,
  RecordHoneyFrameFeedingResponse,
} from '../types/honey-frame-feeding';

type RecordHoneyFrameFeedingScreenProps =
  | {
      apiaryId: string;
      hiveId?: never;
    }
  | {
      hiveId: string;
      apiaryId?: never;
    };

const today = formatDateOnly(new Date());
const frameCountOptions = Array.from({ length: 10 }, (_, index) => index + 1);

export function RecordHoneyFrameFeedingScreen(
  props: RecordHoneyFrameFeedingScreenProps,
) {
  const { openDrawer } = useAppDrawer();
  const isSingleHive = 'hiveId' in props;
  const hiveId = props.hiveId ?? '';
  const apiaryId = props.apiaryId ?? '';
  const hiveQuery = useHive(hiveId);
  const apiaryHivesQuery = useHives(apiaryId);
  const mutation = useRecordHoneyFrameFeeding();
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<RecordHoneyFrameFeedingFormValues>({
    resolver: zodResolver(recordHoneyFrameFeedingSchema),
    defaultValues: {
      performedOn: today,
      frameSource: '',
      notes: '',
      hives: isSingleHive ? [{ hiveId, frameCount: 1 }] : [],
    },
  });
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'hives',
  });
  const selectedHives = useWatch({ control, name: 'hives' });

  const selectableHives: HiveListItem[] = isSingleHive
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

    replace([{ hiveId, frameCount: 1 }]);
  }, [hiveId, hiveQuery.data, isSingleHive, replace, selectedHives]);

  const isLoadingHives = isSingleHive
    ? hiveQuery.isLoading
    : apiaryHivesQuery.isLoading;
  const hasHiveError = isSingleHive
    ? hiveQuery.isError || !hiveQuery.data
    : apiaryHivesQuery.isError || !apiaryHivesQuery.data;
  const hivesError =
    typeof errors.hives?.message === 'string' ? errors.hives.message : undefined;

  const toggleHive = (selectedHiveId: string) => {
    if (isSingleHive) {
      return;
    }

    const index = fields.findIndex((field) => field.hiveId === selectedHiveId);

    if (index >= 0) {
      remove(index);
      return;
    }

    append({ hiveId: selectedHiveId, frameCount: 1 });
  };

  const onSubmit = async (values: RecordHoneyFrameFeedingFormValues) => {
    clearErrors();

    try {
      const response = await mutation.mutateAsync(toRequest(values));
      Keyboard.dismiss();
      showSuccess(response, isSingleHive, hiveId, apiaryId);
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

  return (
    <Screen header={<AppHeader onMenuPress={openDrawer} />}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vrati se nazad"
          onPress={() => router.back()}
          className="mb-3 min-h-11 self-start justify-center py-2"
        >
          <Text className="text-sm font-semibold text-primary">← Nazad</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-foreground">
          Prihrana ramovima meda
        </Text>
        <Text className="mt-1 text-sm leading-5 text-muted">
          Unesite opšte podatke, a zatim odaberite košnice i broj ramova za svaku.
        </Text>

        <Text className="mb-3 mt-7 text-lg font-bold text-foreground">
          Opšti podaci
        </Text>
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
          <Controller
            control={control}
            name="frameSource"
            render={({ field }) => (
              <FormTextInput
                label="Poreklo ramova"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Na primer druga košnica ili pčelinjak"
                error={errors.frameSource?.message}
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
            : 'Prikazane su aktivne košnice koje trenutno pripadaju ovom pčelinjaku. Izaberite jednu ili više.'}
        </Text>

        {selectableHives.length === 0 ? (
          <EmptyState isSingleHive={isSingleHive} />
        ) : (
          <View className="gap-3">
            {selectableHives.map((hive) => {
              const selectedIndex = fields.findIndex(
                (field) => field.hiveId === hive.id,
              );
              const selected = selectedIndex >= 0;

              return (
                <HoneyFrameHiveRow
                  key={hive.id}
                  hive={hive}
                  selected={selected}
                  selectionDisabled={isSingleHive}
                  frameCount={selectedHives?.[selectedIndex]?.frameCount ?? 1}
                  error={
                    selected
                      ? errors.hives?.[selectedIndex]?.frameCount?.message
                      : undefined
                  }
                  onToggle={() => toggleHive(hive.id)}
                  onFrameCountChange={(frameCount) => {
                    if (selectedIndex < 0) {
                      return;
                    }

                    setValue(`hives.${selectedIndex}.frameCount`, frameCount, {
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
            accessibilityLabel="Otkaži unos prihrane ramovima meda"
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
            accessibilityLabel="Sačuvaj prihranu ramovima meda"
            disabled={mutation.isPending || selectableHives.length === 0}
            onPress={() => void handleSubmit(onSubmit)()}
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

function HoneyFrameHiveRow({
  hive,
  selected,
  selectionDisabled,
  frameCount,
  error,
  onToggle,
  onFrameCountChange,
}: {
  hive: HiveListItem;
  selected: boolean;
  selectionDisabled: boolean;
  frameCount: number;
  error?: string;
  onToggle: () => void;
  onFrameCountChange: (frameCount: number) => void;
}) {
  return (
    <View
      className={`rounded-3xl border bg-surface px-4 py-3 ${
        selected ? 'border-primary' : 'border-border'
      }`}
    >
      <View className="min-h-14 flex-row items-center">
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selected, disabled: selectionDisabled }}
          accessibilityLabel={`${selected ? 'Odznači' : 'Označi'} košnicu ${hive.label}`}
          disabled={selectionDisabled}
          onPress={onToggle}
          className="mr-3 flex-1 self-stretch justify-center"
        >
          <Text className="text-base font-bold text-foreground">{hive.label}</Text>
          {hive.identificationNumber && (
            <Text className="mt-1 text-sm text-muted">Oznaka: {hive.identificationNumber}</Text>
          )}
        </Pressable>

        <FrameCountSelect
          value={frameCount}
          disabled={!selected}
          hiveLabel={hive.label}
          onChange={onFrameCountChange}
        />
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selected, disabled: selectionDisabled }}
          accessibilityLabel={`${selected ? 'Odznači' : 'Označi'} košnicu ${hive.label}`}
          disabled={selectionDisabled}
          onPress={onToggle}
          className={`ml-3 h-8 w-8 items-center justify-center rounded-full border ${
            selected ? 'border-primary bg-primary' : 'border-border bg-surface'
          }`}
        >
          {selected && <Ionicons name="checkmark" size={19} color={colors.onPrimary} />}
        </Pressable>
      </View>
      {error && <Text className="mt-2 text-xs text-error">{error}</Text>}
    </View>
  );
}

function FrameCountSelect({
  value,
  disabled,
  hiveLabel,
  onChange,
}: {
  value: number;
  disabled: boolean;
  hiveLabel: string;
  onChange: (value: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Broj ramova za košnicu ${hiveLabel}: ${value}`}
        accessibilityHint="Otvara izbor od jednog do deset ramova"
        disabled={disabled}
        onPress={() => setIsOpen(true)}
        className={`h-11 min-w-16 flex-row items-center justify-center rounded-xl border bg-background px-3 ${
          disabled ? 'border-border opacity-60' : 'border-primary'
        }`}
      >
        <Text className="text-base font-bold text-foreground">{value}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.muted} />
      </Pressable>

      <Modal
        transparent
        visible={isOpen}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zatvori izbor broja ramova"
          onPress={() => setIsOpen(false)}
          className="flex-1 items-center justify-center bg-black/40 px-8"
        >
          <Pressable
            accessibilityRole="menu"
            onPress={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-surface p-5"
          >
            <Text className="text-lg font-bold text-foreground">Broj ramova</Text>
            <Text className="mt-1 text-sm text-muted">Izaberite od 1 do 10 ramova.</Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              {frameCountOptions.map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: option === value }}
                  onPress={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`h-11 w-11 items-center justify-center rounded-xl border ${
                    option === value
                      ? 'border-primary bg-primary'
                      : 'border-border bg-background'
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      option === value ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function toRequest(
  values: RecordHoneyFrameFeedingFormValues,
): RecordHoneyFrameFeedingRequest {
  return {
    performedAt: toPerformedAt(values.performedOn),
    frameSource: optionalText(values.frameSource),
    notes: optionalText(values.notes),
    imageUrl: null,
    hives: values.hives.map((hive) => ({
      hiveId: hive.hiveId,
      frameCount: hive.frameCount,
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

function showSuccess(
  response: RecordHoneyFrameFeedingResponse,
  isSingleHive: boolean,
  hiveId: string,
  apiaryId: string,
) {
  Alert.alert(
    'Prihrana je sačuvana',
    `Broj košnica: ${response.affectedHiveCount}\nUkupno dato: ${formatFrames(response.totalFrameCount)}`,
    [
      {
        text: 'U redu',
        onPress: () => {
          router.replace(isSingleHive ? `/hives/${hiveId}` : `/apiaries/${apiaryId}`);
        },
      },
    ],
  );
}

function applyServerValidationErrors(
  error: unknown,
  setError: UseFormSetError<RecordHoneyFrameFeedingFormValues>,
) {
  if (!(error instanceof ApiError) || !error.problem?.errors) {
    return false;
  }

  const fieldMap: Record<string, keyof RecordHoneyFrameFeedingFormValues> = {
    performedAt: 'performedOn',
    frameSource: 'frameSource',
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

    setError(field, { type: 'server', message: messages[0] });
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

function formatFrames(value: number) {
  return `${value} ${value === 1 ? 'ram' : value >= 2 && value <= 4 ? 'rama' : 'ramova'}`;
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

function EmptyState({ isSingleHive }: { isSingleHive: boolean }) {
  return (
    <View className="rounded-3xl border border-border bg-surface px-6 py-8">
      <Text className="text-center text-base font-semibold text-foreground">
        {isSingleHive ? 'Košnica nije dostupna' : 'Nema aktivnih košnica'}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-muted">
        {isSingleHive
          ? 'Ova košnica više nije dostupna za evidentiranje prihrane.'
          : 'Dodajte ili aktivirajte košnicu u ovom pčelinjaku, pa pokušajte ponovo.'}
      </Text>
    </View>
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
