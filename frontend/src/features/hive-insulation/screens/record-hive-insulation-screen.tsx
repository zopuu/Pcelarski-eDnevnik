import { zodResolver } from '@hookform/resolvers/zod';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useQueries } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
  ScrollView,
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

import { getCurrentHiveInsulation } from '../api/get-current-hive-insulation';
import { hiveInsulationQueryKeys } from '../hive-insulation-query-keys';
import { useRecordHiveInsulation } from '../hooks/use-record-hive-insulation';
import {
  recordHiveInsulationSchema,
  type RecordHiveInsulationFormValues,
} from '../schemas/record-hive-insulation-schema';
import type {
  HiveInsulationOperation,
  HiveInsulationState,
  RecordHiveInsulationHive,
  RecordHiveInsulationRequest,
} from '../types/hive-insulation';

type RecordHiveInsulationScreenProps =
  | {
      apiaryId: string;
      hiveId?: never;
    }
  | {
      hiveId: string;
      apiaryId?: never;
    };

type InsulationType = 'paper' | 'eps' | 'xps';

const today = formatDateOnly(new Date());
const insulationTypes: readonly {
  key: InsulationType;
  label: string;
}[] = [
  { key: 'paper', label: 'Papir' },
  { key: 'eps', label: 'Stiropor' },
  { key: 'xps', label: 'Stirodur' },
];

export function RecordHiveInsulationScreen(props: RecordHiveInsulationScreenProps) {
  const { openDrawer } = useAppDrawer();
  const isSingleHive = 'hiveId' in props;
  const hiveId = props.hiveId ?? '';
  const apiaryId = props.apiaryId ?? '';
  const hiveQuery = useHive(hiveId);
  const apiaryHivesQuery = useHives(apiaryId);
  const mutation = useRecordHiveInsulation();
  const [isBulkFillOpen, setIsBulkFillOpen] = useState(false);
  const [bulkHiveIds, setBulkHiveIds] = useState<string[]>([]);
  const [bulkPaper, setBulkPaper] = useState(false);
  const [bulkEps, setBulkEps] = useState(false);
  const [bulkXps, setBulkXps] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkNotice, setBulkNotice] = useState<string | null>(null);

  const selectableHives: HiveListItem[] = useMemo(
    () =>
      isSingleHive
        ? hiveQuery.data
          ? [hiveQuery.data]
          : []
        : (apiaryHivesQuery.data ?? []).filter((hive) => hive.status === 'active'),
    [isSingleHive, hiveQuery.data, apiaryHivesQuery.data],
  );

  const currentStateQueries = useQueries({
    queries: selectableHives.map((hive) => ({
      queryKey: hiveInsulationQueryKeys.current(hive.id),
      queryFn: () => getCurrentHiveInsulation(hive.id),
    })),
  });
  const statesByHiveId = useMemo(
    () =>
      new Map(
        selectableHives.flatMap((hive, index) => {
          const state = currentStateQueries[index]?.data;

          return state ? [[hive.id, state] as const] : [];
        }),
      ),
    [currentStateQueries, selectableHives],
  );
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm<RecordHiveInsulationFormValues>({
    resolver: zodResolver(recordHiveInsulationSchema),
    defaultValues: {
      performedOn: today,
      operation: 'add',
      notes: '',
      hives: isSingleHive ? [createHiveSelection(hiveId)] : [],
    },
  });
  const { fields, append, remove, replace, update } = useFieldArray({
    control,
    name: 'hives',
  });
  const watchedHives = useWatch({ control, name: 'hives' });
  const selectedHives = useMemo(() => watchedHives ?? [], [watchedHives]);
  const operation = useWatch({ control, name: 'operation' });

  useEffect(() => {
    if (!isSingleHive || !hiveQuery.data || selectedHives[0]?.hiveId === hiveId) {
      return;
    }

    replace([createHiveSelection(hiveId)]);
  }, [hiveId, hiveQuery.data, isSingleHive, replace, selectedHives]);

  const isLoadingHives = isSingleHive ? hiveQuery.isLoading : apiaryHivesQuery.isLoading;
  const hasHiveError = isSingleHive
    ? hiveQuery.isError || !hiveQuery.data
    : apiaryHivesQuery.isError || !apiaryHivesQuery.data;
  const isLoadingStates = currentStateQueries.some((query) => query.isLoading);
  const hasStateError = currentStateQueries.some((query) => query.isError);

  const updateHiveSelection = (
    selectedHiveId: string,
    updateSelection: (selection: RecordHiveInsulationHive) => RecordHiveInsulationHive,
  ) => {
    const index = fields.findIndex((field) => field.hiveId === selectedHiveId);
    const current = getValues('hives')[index] ?? createHiveSelection(selectedHiveId);
    const next = updateSelection(current);

    if (!hasSelectedMaterial(next)) {
      if (isSingleHive) {
        replace([createHiveSelection(selectedHiveId)]);
      } else if (index >= 0) {
        remove(index);
      }

      return;
    }

    if (index >= 0) {
      update(index, next);
      return;
    }

    append(next);
  };

  const toggleMaterial = (selectedHiveId: string, type: InsulationType) => {
    const state = statesByHiveId.get(selectedHiveId);

    if (!state || !isMaterialAvailable(state, operation, type)) {
      return;
    }

    updateHiveSelection(selectedHiveId, (selection) => ({
      ...selection,
      [type]: !selection[type],
    }));
  };

  const selectOperation = (nextOperation: HiveInsulationOperation) => {
    if (nextOperation === operation) {
      return;
    }

    clearErrors('hives');
    setBulkNotice(null);
    replace(isSingleHive ? [createHiveSelection(hiveId)] : []);
    setValue('operation', nextOperation, { shouldValidate: true });
  };

  const applyBulkFill = () => {
    const selectedTypes = {
      paper: bulkPaper,
      eps: bulkEps,
      xps: bulkXps,
    };

    if (!bulkHiveIds.length) {
      setBulkError('Izaberite najmanje jednu košnicu.');
      return;
    }

    if (!hasSelectedMaterial(selectedTypes)) {
      setBulkError('Izaberite najmanje jedan materijal.');
      return;
    }

    let skippedTypes = 0;

    bulkHiveIds.forEach((selectedHiveId) => {
      const state = statesByHiveId.get(selectedHiveId);

      if (!state) {
        return;
      }

      const validTypes = {
        paper: selectedTypes.paper && isMaterialAvailable(state, operation, 'paper'),
        eps: selectedTypes.eps && isMaterialAvailable(state, operation, 'eps'),
        xps: selectedTypes.xps && isMaterialAvailable(state, operation, 'xps'),
      };
      skippedTypes +=
        Number(selectedTypes.paper && !validTypes.paper) +
        Number(selectedTypes.eps && !validTypes.eps) +
        Number(selectedTypes.xps && !validTypes.xps);

      if (!hasSelectedMaterial(validTypes)) {
        return;
      }

      updateHiveSelection(selectedHiveId, (selection) => ({
        ...selection,
        paper: selection.paper || validTypes.paper,
        eps: selection.eps || validTypes.eps,
        xps: selection.xps || validTypes.xps,
      }));
    });

    setBulkNotice(
      skippedTypes
        ? `${skippedTypes} izbor(a) nije primenjeno jer materijal nije dostupan za izabranu operaciju.`
        : 'Izbori su primenjeni na označene košnice.',
    );
    setBulkError(null);
    setIsBulkFillOpen(false);
  };

  const onSubmit = async (values: RecordHiveInsulationFormValues) => {
    clearErrors();

    try {
      await mutation.mutateAsync(toRequest(values));
      Keyboard.dismiss();
      Alert.alert('Izolacija je sačuvana', 'Akcija je evidentirana za izabrane košnice.', [
        {
          text: 'U redu',
          onPress: () => {
            router.replace(isSingleHive ? `/hives/${hiveId}` : `/apiaries/${apiaryId}`);
          },
        },
      ]);
    } catch (error) {
      if (applyServerValidationErrors(error, setError)) {
        return;
      }

      Alert.alert('Izolacija nije sačuvana', getMutationErrorMessage(error));
    }
  };

  if (isLoadingHives || isLoadingStates) {
    return <LoadingState />;
  }

  if (hasHiveError || hasStateError) {
    return (
      <Screen header={<AppHeader onMenuPress={openDrawer} />}>
        <ErrorState
          onRetry={() => {
            if (isSingleHive) {
              void hiveQuery.refetch();
            } else {
              void apiaryHivesQuery.refetch();
            }

            void Promise.all(currentStateQueries.map((query) => query.refetch()));
          }}
        />
      </Screen>
    );
  }

  const hivesError = typeof errors.hives?.message === 'string' ? errors.hives.message : undefined;

  return (
    <>
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

          <Text className="text-2xl font-bold text-foreground">Izolacija košnica</Text>
          <Text className="mt-1 text-sm leading-5 text-muted">
            Izaberite operaciju, datum i materijale za svaku košnicu posebno.
          </Text>

          <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Opšti podaci</Text>
          <View className="rounded-3xl border border-border bg-surface px-5 pb-1 pt-5">
            <Controller
              control={control}
              name="operation"
              render={({ field }) => (
                <OperationField value={field.value} onChange={selectOperation} />
              )}
            />
            <Controller
              control={control}
              name="performedOn"
              render={({ field, fieldState }) => (
                <DatePickerField
                  label="Datum evidentiranja *"
                  value={field.value}
                  onChange={field.onChange}
                  maximumDate={today}
                  required
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="notes"
              render={({ field, fieldState }) => (
                <FormTextInput
                  label="Napomena"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Dodatne informacije o izolaciji"
                  multiline
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>

          <View className="mb-3 mt-7 flex-row items-center justify-between gap-3">
            <Text className="flex-1 text-lg font-bold text-foreground">
              {isSingleHive ? 'Materijali za košnicu' : 'Košnice i materijali'}
            </Text>
            {!isSingleHive && selectableHives.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Masovno popuni materijale izolacije"
                onPress={() => {
                  setBulkError(null);
                  setIsBulkFillOpen(true);
                }}
                className="min-h-11 justify-center rounded-2xl border border-primary px-3"
              >
                <Text className="text-sm font-bold text-primary">Masovno popuni</Text>
              </Pressable>
            )}
          </View>
          <Text className="mb-4 text-sm leading-5 text-muted">
            {isSingleHive
              ? 'Dostupni su samo materijali koji odgovaraju trenutnom stanju košnice.'
              : 'Svaka kartica ima sopstveni izbor materijala. Košnica se evidentira kada izaberete najmanje jedan materijal.'}
          </Text>

          {bulkNotice && <Text className="mb-3 text-sm text-muted">{bulkNotice}</Text>}

          {selectableHives.length === 0 ? (
            <EmptyState isSingleHive={isSingleHive} />
          ) : (
            <View className="gap-3">
              {selectableHives.map((hive) => {
                const state = statesByHiveId.get(hive.id)!;
                const index = fields.findIndex((field) => field.hiveId === hive.id);
                const selection = selectedHives[index] ?? createHiveSelection(hive.id);

                return (
                  <HiveInsulationCard
                    key={hive.id}
                    hive={hive}
                    state={state}
                    operation={operation}
                    selection={selection}
                    fixed={isSingleHive}
                    error={index >= 0 ? errors.hives?.[index]?.paper?.message : undefined}
                    onToggle={(type) => toggleMaterial(hive.id, type)}
                  />
                );
              })}
            </View>
          )}

          {hivesError && <Text className="mt-2 text-sm text-error">{hivesError}</Text>}

          <View className="mt-7 gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Otkaži unos izolacije"
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
              accessibilityLabel="Sačuvaj izolaciju"
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
                <Text className="text-base font-bold text-white">Sačuvaj izolaciju</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAwareScrollView>
      </Screen>

      <BulkFillModal
        visible={isBulkFillOpen}
        hives={selectableHives}
        statesByHiveId={statesByHiveId}
        operation={operation}
        selectedHiveIds={bulkHiveIds}
        paper={bulkPaper}
        eps={bulkEps}
        xps={bulkXps}
        error={bulkError}
        onClose={() => setIsBulkFillOpen(false)}
        onToggleHive={(selectedHiveId) => {
          setBulkHiveIds((current) =>
            current.includes(selectedHiveId)
              ? current.filter((id) => id !== selectedHiveId)
              : [...current, selectedHiveId],
          );
        }}
        onTogglePaper={() => setBulkPaper((value) => !value)}
        onToggleEps={() => setBulkEps((value) => !value)}
        onToggleXps={() => setBulkXps((value) => !value)}
        onApply={applyBulkFill}
      />
    </>
  );
}

function OperationField({
  value,
  onChange,
}: {
  value: HiveInsulationOperation;
  onChange: (operation: HiveInsulationOperation) => void;
}) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-foreground">Operacija *</Text>
      <View className="flex-row gap-2">
        <OperationButton
          label="Dodaj izolaciju"
          selected={value === 'add'}
          onPress={() => onChange('add')}
        />
        <OperationButton
          label="Ukloni izolaciju"
          selected={value === 'remove'}
          onPress={() => onChange('remove')}
        />
      </View>
    </View>
  );
}

function OperationButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      className={`min-h-12 flex-1 items-center justify-center rounded-2xl border px-3 ${
        selected ? 'border-primary bg-primary/10' : 'border-border bg-background'
      }`}
    >
      <Text className={`text-sm font-bold ${selected ? 'text-primary' : 'text-foreground'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function HiveInsulationCard({
  hive,
  state,
  operation,
  selection,
  fixed,
  error,
  onToggle,
}: {
  hive: HiveListItem;
  state: HiveInsulationState;
  operation: HiveInsulationOperation;
  selection: RecordHiveInsulationHive;
  fixed: boolean;
  error?: string;
  onToggle: (type: InsulationType) => void;
}) {
  const selected = hasSelectedMaterial(selection);

  return (
    <View
      className={`rounded-3xl border bg-surface px-4 py-4 ${selected ? 'border-primary' : 'border-border'}`}
    >
      <View className="flex-row items-center">
        <View className="flex-1 pr-3">
          <Text className="text-base font-bold text-foreground">{hive.label}</Text>
          {hive.identificationNumber && (
            <Text className="mt-1 text-sm text-muted">Oznaka: {hive.identificationNumber}</Text>
          )}
        </View>
        <View
          accessibilityLabel={
            selected ? 'Košnica ima izabrane materijale' : 'Košnica nema izabrane materijale'
          }
          className={`h-8 w-8 items-center justify-center rounded-full border ${
            selected ? 'border-primary bg-primary' : 'border-border bg-background'
          }`}
        >
          {selected && <Ionicons name="checkmark" size={19} color={colors.onPrimary} />}
        </View>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {insulationTypes.map((type) => {
          const available = isMaterialAvailable(state, operation, type.key);
          const checked = selection[type.key];

          return (
            <MaterialToggle
              key={type.key}
              label={type.label}
              checked={checked}
              disabled={!available}
              hiveLabel={hive.label}
              onPress={() => onToggle(type.key)}
            />
          );
        })}
      </View>

      {!fixed && !selected && (
        <Text className="mt-3 text-xs text-muted">Izaberite materijal da uključite košnicu.</Text>
      )}
      {error && <Text className="mt-3 text-xs text-error">{error}</Text>}
    </View>
  );
}

function MaterialToggle({
  label,
  checked,
  disabled,
  hiveLabel,
  onPress,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  hiveLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={`${label} za košnicu ${hiveLabel}`}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-11 flex-row items-center rounded-2xl border px-3 ${
        checked ? 'border-primary bg-primary/10' : 'border-border bg-background'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <View
        className={`mr-2 h-5 w-5 items-center justify-center rounded border ${
          checked ? 'border-primary bg-primary' : 'border-border bg-surface'
        }`}
      >
        {checked && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
      </View>
      <Text className={`text-sm font-semibold ${checked ? 'text-primary' : 'text-foreground'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function BulkFillModal({
  visible,
  hives,
  statesByHiveId,
  operation,
  selectedHiveIds,
  paper,
  eps,
  xps,
  error,
  onClose,
  onToggleHive,
  onTogglePaper,
  onToggleEps,
  onToggleXps,
  onApply,
}: {
  visible: boolean;
  hives: HiveListItem[];
  statesByHiveId: Map<string, HiveInsulationState>;
  operation: HiveInsulationOperation;
  selectedHiveIds: string[];
  paper: boolean;
  eps: boolean;
  xps: boolean;
  error: string | null;
  onClose: () => void;
  onToggleHive: (hiveId: string) => void;
  onTogglePaper: () => void;
  onToggleEps: () => void;
  onToggleXps: () => void;
  onApply: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[88%] rounded-t-3xl bg-surface px-5 pb-8 pt-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">Masovno popunjavanje</Text>
              <Text className="mt-1 text-sm leading-5 text-muted">
                Izaberite materijale i košnice. Nedostupni materijali biće preskočeni.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Zatvori masovno popunjavanje"
              onPress={onClose}
              className="h-11 w-11 items-center justify-center rounded-full bg-background"
            >
              <Ionicons name="close" size={22} color={colors.foreground} />
            </Pressable>
          </View>

          <View className="mt-5 flex-row flex-wrap gap-2">
            <BulkMaterialToggle label="Papir" checked={paper} onPress={onTogglePaper} />
            <BulkMaterialToggle label="Stiropor" checked={eps} onPress={onToggleEps} />
            <BulkMaterialToggle label="Stirodur" checked={xps} onPress={onToggleXps} />
          </View>

          <Text className="mb-2 mt-6 text-sm font-semibold text-foreground">Košnice</Text>
          <ScrollView showsVerticalScrollIndicator={false} className="max-h-72">
            <View className="gap-2 pb-2">
              {hives.map((hive) => {
                const selected = selectedHiveIds.includes(hive.id);
                const state = statesByHiveId.get(hive.id)!;
                const hasAvailableMaterial = insulationTypes.some((type) =>
                  isMaterialAvailable(state, operation, type.key),
                );

                return (
                  <Pressable
                    key={hive.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected, disabled: !hasAvailableMaterial }}
                    accessibilityLabel={`Označi košnicu ${hive.label} za masovno popunjavanje`}
                    disabled={!hasAvailableMaterial}
                    onPress={() => onToggleHive(hive.id)}
                    className={`min-h-14 flex-row items-center rounded-2xl border px-4 ${
                      selected ? 'border-primary bg-primary/10' : 'border-border bg-background'
                    } ${hasAvailableMaterial ? '' : 'opacity-40'}`}
                  >
                    <View
                      className={`mr-3 h-6 w-6 items-center justify-center rounded-full border ${
                        selected ? 'border-primary bg-primary' : 'border-border bg-surface'
                      }`}
                    >
                      {selected && <Ionicons name="checkmark" size={16} color={colors.onPrimary} />}
                    </View>
                    <Text className="flex-1 text-base font-semibold text-foreground">
                      {hive.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {error && <Text className="mt-3 text-sm text-error">{error}</Text>}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Primeni masovno popunjavanje"
            onPress={onApply}
            className="mt-5 min-h-14 items-center justify-center rounded-2xl bg-primary px-5"
          >
            <Text className="text-base font-bold text-white">Primeni na košnice</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function BulkMaterialToggle({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={`Masovno: ${label}`}
      onPress={onPress}
      className={`min-h-11 flex-row items-center rounded-2xl border px-3 ${
        checked ? 'border-primary bg-primary/10' : 'border-border bg-background'
      }`}
    >
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={18}
        color={checked ? colors.primary : colors.muted}
      />
      <Text
        className={`ml-2 text-sm font-semibold ${checked ? 'text-primary' : 'text-foreground'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function createHiveSelection(hiveId: string): RecordHiveInsulationHive {
  return { hiveId, paper: false, eps: false, xps: false };
}

function hasSelectedMaterial(selection: Pick<RecordHiveInsulationHive, InsulationType>) {
  return selection.paper || selection.eps || selection.xps;
}

function isMaterialAvailable(
  state: HiveInsulationState,
  operation: HiveInsulationOperation,
  type: InsulationType,
) {
  return operation === 'add' ? !state[type] : state[type];
}

function toRequest(values: RecordHiveInsulationFormValues): RecordHiveInsulationRequest {
  return {
    performedAt: toPerformedAt(values.performedOn),
    operation: values.operation,
    notes: optionalText(values.notes),
    imageUrl: null,
    hives: values.hives,
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

function applyServerValidationErrors(
  error: unknown,
  setError: UseFormSetError<RecordHiveInsulationFormValues>,
) {
  if (!(error instanceof ApiError) || !error.problem?.errors) {
    return false;
  }

  const fieldMap: Record<string, keyof RecordHiveInsulationFormValues> = {
    performedAt: 'performedOn',
    operation: 'operation',
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
    return 'Stanje izolacije se promenilo. Osvežite podatke i pokušajte ponovo.';
  }

  if (error instanceof ApiError && error.status === 400) {
    return 'Proverite označena polja i pokušajte ponovo.';
  }

  return error instanceof Error
    ? error.message
    : 'Izolaciju nije moguće sačuvati. Pokušajte ponovo.';
}

function LoadingState() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-3 text-muted">Učitavanje stanja izolacije...</Text>
      </View>
    </Screen>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-base font-semibold text-error">
        Nije moguće učitati košnice ili stanje izolacije.
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

function EmptyState({ isSingleHive }: { isSingleHive: boolean }) {
  return (
    <View className="rounded-3xl border border-border bg-surface px-6 py-8">
      <Text className="text-center text-base font-semibold text-foreground">
        {isSingleHive ? 'Košnica nije dostupna' : 'Nema aktivnih košnica'}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-muted">
        {isSingleHive
          ? 'Ova košnica više nije dostupna za evidentiranje izolacije.'
          : 'Dodajte ili aktivirajte košnicu u ovom pčelinjaku, pa pokušajte ponovo.'}
      </Text>
    </View>
  );
}
