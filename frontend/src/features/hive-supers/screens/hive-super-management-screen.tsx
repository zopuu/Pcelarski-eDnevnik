import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type FieldPath,
  type UseFormSetError,
} from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { CountField } from '@/features/hive-inspections/components/inspection-form-controls';
import { HiveColorPicker } from '@/features/hives/components/hive-color-picker';
import { useHive } from '@/features/hives/hooks/use-hive';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { ApiError } from '@/shared/api/api-error';
import { ColorHexagon } from '@/shared/components/color-hexagon/color-hexagon';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';

import { useHiveSupers } from '../hooks/use-hive-supers';
import { useAddHiveSupers, useRemoveHiveSupers } from '../hooks/use-manage-hive-supers';
import {
  addHiveSupersSchema,
  type AddHiveSupersFormValues,
} from '../schemas/add-hive-supers-schema';
import type { HiveSuper, HiveSuperOperation } from '../types/hive-super';

type ManagementMode = 'add' | 'remove' | null;

type RemovalConfiguration = {
  operation: HiveSuperOperation;
  harvestableFrameCount: number | null;
};

const defaultAddValues: AddHiveSupersFormValues = {
  superCount: 1,
  supers: [{ frameCount: 10, colorHex: '#FACC15' }],
};

const hiveTypeLabels: Record<string, string> = {
  dadantBlatt: 'DB',
  langstrothRoot: 'LR',
  albertiZnidersic: 'AŽ',
  farrar: 'Farar',
  nucleus: 'Nukleus',
  other: 'Ostalo',
};

export function HiveSuperManagementScreen({ hiveId }: { hiveId: string }) {
  const { openDrawer } = useAppDrawer();
  const hiveQuery = useHive(hiveId);
  const supersQuery = useHiveSupers(hiveId);
  const addMutation = useAddHiveSupers(hiveId);
  const removeMutation = useRemoveHiveSupers(hiveId);
  const [mode, setMode] = useState<ManagementMode>(null);
  const [removals, setRemovals] = useState<Record<string, RemovalConfiguration>>({});
  const [selectedSuper, setSelectedSuper] = useState<HiveSuper | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    clearErrors,
    reset,
    setError,
    formState: { errors, isValid },
  } = useForm<AddHiveSupersFormValues>({
    resolver: zodResolver(addHiveSupersSchema),
    defaultValues: defaultAddValues,
    mode: 'onChange',
  });

  const isMutating = addMutation.isPending || removeMutation.isPending;
  const supers = supersQuery.data ?? [];
  const configuredRemovalCount = Object.keys(removals).length;

  const resetMode = () => {
    if (isMutating) return;
    setMode(null);
    setRemovals({});
    setSelectedSuper(null);
    setRemoveError(null);
    reset(defaultAddValues);
  };

  const startMode = (nextMode: Exclude<ManagementMode, null>) => {
    if (isMutating || mode) return;
    setRemoveError(null);
    setMode(nextMode);
  };

  const submitAdd = async (values: AddHiveSupersFormValues) => {
    clearErrors();
    try {
      await addMutation.mutateAsync({ supers: values.supers });
      router.replace({ pathname: '/hives/[hiveId]', params: { hiveId } });
    } catch (error) {
      if (!applyAddServerValidationErrors(error, setError)) {
        setError('root', { type: 'server', message: getMutationErrorMessage(error) });
      }
    }
  };

  const configureRemoval = (configuration: RemovalConfiguration) => {
    if (!selectedSuper) return;
    setRemovals((current) => ({ ...current, [selectedSuper.id]: configuration }));
    setSelectedSuper(null);
    setRemoveError(null);
  };

  const unselectSuper = (superId: string) => {
    setRemovals((current) => {
      const { [superId]: _removed, ...remaining } = current;
      return remaining;
    });
    setRemoveError(null);
  };

  const submitRemoval = async () => {
    if (configuredRemovalCount === 0) {
      setRemoveError('Izaberite najmanje jedan nastavak.');
      return;
    }

    setRemoveError(null);
    try {
      await removeMutation.mutateAsync({
        items: Object.entries(removals).map(([hiveSuperId, configuration]) => ({
          hiveSuperId,
          operation: configuration.operation,
          harvestableFrameCount: configuration.harvestableFrameCount,
        })),
      });
      router.replace({ pathname: '/hives/[hiveId]', params: { hiveId } });
    } catch (error) {
      setRemoveError(getMutationErrorMessage(error));
    }
  };

  if (hiveQuery.isLoading || supersQuery.isLoading) {
    return <StateScreen label="Učitavanje nastavaka..." />;
  }

  if (hiveQuery.isError || supersQuery.isError || !hiveQuery.data) {
    return (
      <StateScreen
        label="Nije moguće učitati podatke o nastavcima."
        retry={() => {
          void hiveQuery.refetch();
          void supersQuery.refetch();
        }}
      />
    );
  }

  return (
    <Screen header={<AppHeader onMenuPress={openDrawer} />}>
      <KeyboardAwareScrollView
        bottomOffset={28}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vrati se na detalje košnice"
          onPress={() => router.back()}
          className="mb-3 min-h-11 self-start justify-center py-2"
        >
          <Text className="text-base font-semibold text-primary">← Nazad</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-foreground">Upravljanje nastavcima</Text>
        <Text className="mt-1 text-sm leading-5 text-muted">
          Košnica {hiveQuery.data.label} trenutno ima {supers.length}{' '}
          {supers.length === 1 ? 'nastavak' : supers.length < 5 ? 'nastavka' : 'nastavaka'}.
        </Text>

        <ModePicker mode={mode} disabled={isMutating} onSelect={startMode} />

        {mode === 'add' && (
          <AddSupersForm
            control={control}
            errors={errors}
            isValid={isValid}
            isPending={addMutation.isPending}
            onSubmit={handleSubmit(submitAdd)}
            onCancel={resetMode}
          />
        )}

        {mode === 'remove' && (
          <RemoveSupersPanel
            supers={supers}
            removals={removals}
            error={removeError}
            isPending={removeMutation.isPending}
            onSelect={(superItem) => setSelectedSuper(superItem)}
            onUnselect={unselectSuper}
            onSubmit={() => void submitRemoval()}
            onCancel={resetMode}
          />
        )}

        {mode === null && (
          <View className="mt-5 rounded-3xl border border-border bg-surface px-5 py-4">
            <Text className="text-sm leading-5 text-muted">
              Izaberite jednu radnju. Dodavanje i uklanjanje se vode kao odvojene akcije radi tačnog
              praćenja stanja nastavaka.
            </Text>
          </View>
        )}
      </KeyboardAwareScrollView>

      <RemoveSuperModal
        superItem={selectedSuper}
        visible={selectedSuper !== null}
        onClose={() => setSelectedSuper(null)}
        onConfirm={configureRemoval}
      />
    </Screen>
  );
}

function ModePicker({
  mode,
  disabled,
  onSelect,
}: {
  mode: ManagementMode;
  disabled: boolean;
  onSelect: (mode: Exclude<ManagementMode, null>) => void;
}) {
  const choices: { mode: Exclude<ManagementMode, null>; title: string; description: string }[] = [
    { mode: 'add', title: 'Dodaj nastavke', description: 'Dodajte nove nastavke na košnicu.' },
    {
      mode: 'remove',
      title: 'Ukloni nastavke',
      description: 'Pripremite nastavke za vrcanje ili arhivu.',
    },
  ];

  return (
    <View className="mt-6 flex-row gap-3">
      {choices.map((choice) => {
        const active = mode === choice.mode;
        const unavailable = disabled || (mode !== null && !active);
        return (
          <Pressable
            key={choice.mode}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled: unavailable }}
            disabled={unavailable}
            onPress={() => onSelect(choice.mode)}
            className={`min-h-28 flex-1 rounded-3xl border px-4 py-4 ${active ? 'border-primary bg-primary/10' : 'border-border bg-surface'} ${unavailable ? 'opacity-45' : ''}`}
          >
            <Text className={`text-base font-bold ${active ? 'text-primary' : 'text-foreground'}`}>
              {choice.title}
            </Text>
            <Text className="mt-1 text-xs leading-4 text-muted">{choice.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function AddSupersForm({
  control,
  errors,
  isValid,
  isPending,
  onSubmit,
  onCancel,
}: {
  control: ReturnType<typeof useForm<AddHiveSupersFormValues>>['control'];
  errors: ReturnType<typeof useForm<AddHiveSupersFormValues>>['formState']['errors'];
  isValid: boolean;
  isPending: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const { fields, replace } = useFieldArray({ control, name: 'supers' });
  const superCount = useWatch({ control, name: 'superCount' });

  useEffect(() => {
    const count = Math.max(1, Math.min(10, superCount || 1));
    if (fields.length === count) return;

    replace(
      Array.from({ length: count }, (_, index) =>
        fields[index]
          ? { frameCount: fields[index].frameCount, colorHex: fields[index].colorHex }
          : { frameCount: 10, colorHex: '#FACC15' },
      ),
    );
  }, [fields, replace, superCount]);

  return (
    <View className="mt-6">
      <Text className="mb-3 text-lg font-bold text-foreground">Dodavanje nastavaka</Text>
      <View className="rounded-3xl border border-border bg-surface px-5 pb-1 pt-5">
        <Controller
          control={control}
          name="superCount"
          render={({ field, fieldState }) => (
            <CountField
              label="Broj nastavaka"
              value={field.value}
              onChange={(value) => field.onChange(value ?? 0)}
              maximum={10}
              error={fieldState.error?.message}
            />
          )}
        />
        <Text className="mb-4 text-sm leading-5 text-muted">
          Podesite broj ramova i boju za svaki nastavak posebno.
        </Text>
        <View className="gap-4">
          {fields.map((field, index) => (
            <View
              key={field.id}
              className="rounded-2xl border border-border bg-background px-4 pt-4"
            >
              <Text className="mb-2 text-base font-bold text-foreground">Nastavak {index + 1}</Text>
              <Controller
                control={control}
                name={`supers.${index}.frameCount`}
                render={({ field: superField, fieldState }) => (
                  <CountField
                    label="Broj ramova"
                    value={superField.value}
                    onChange={(value) => superField.onChange(value ?? 0)}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name={`supers.${index}.colorHex`}
                render={({ field: superField, fieldState }) => (
                  <HiveColorPicker
                    value={superField.value}
                    onChange={superField.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>
          ))}
        </View>
        {errors.root?.message && (
          <Text className="-mt-2 mb-5 text-sm text-error">{errors.root.message}</Text>
        )}
      </View>
      <FormActions
        primaryLabel="Dodaj nastavke"
        pendingLabel="Dodavanje..."
        disabled={!isValid}
        isPending={isPending}
        onPrimary={onSubmit}
        onCancel={onCancel}
      />
    </View>
  );
}

function RemoveSupersPanel({
  supers,
  removals,
  error,
  isPending,
  onSelect,
  onUnselect,
  onSubmit,
  onCancel,
}: {
  supers: HiveSuper[];
  removals: Record<string, RemovalConfiguration>;
  error: string | null;
  isPending: boolean;
  onSelect: (superItem: HiveSuper) => void;
  onUnselect: (superId: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const selectedCount = Object.keys(removals).length;
  return (
    <View className="mt-6">
      <Text className="text-lg font-bold text-foreground">Uklanjanje nastavaka</Text>
      <Text className="mt-1 text-sm leading-5 text-muted">
        Dodirnite nastavak i odredite da li ide za vrcanje ili u arhivu. Za svaki nastavak možete
        izabrati drugu radnju.
      </Text>

      {supers.length === 0 ? (
        <View className="mt-4 rounded-3xl border border-border bg-surface px-5 py-6">
          <Text className="text-center text-base font-semibold text-foreground">
            Nema nastavaka na košnici.
          </Text>
          <Text className="mt-1 text-center text-sm leading-5 text-muted">
            Prvo dodajte nastavke da biste mogli da ih uklonite.
          </Text>
        </View>
      ) : (
        <View className="mt-4 gap-3">
          {supers.map((superItem) => {
            const configuration = removals[superItem.id];
            return (
              <Pressable
                key={superItem.id}
                accessibilityRole="button"
                accessibilityState={{ selected: Boolean(configuration), disabled: isPending }}
                disabled={isPending}
                onPress={() => (configuration ? onUnselect(superItem.id) : onSelect(superItem))}
                className={`rounded-3xl border px-4 py-4 ${configuration ? 'border-primary bg-primary/10' : 'border-border bg-surface'} ${isPending ? 'opacity-60' : ''}`}
              >
                <View className="flex-row items-start gap-3">
                  <ColorHexagon
                    colorHex={superItem.colorHex ?? colors.surfaceWarm}
                    borderColor={configuration ? colors.primary : colors.border}
                    accessibilityLabel="Boja nastavka"
                  />
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between gap-2">
                      <Text className="text-base font-bold text-foreground">
                        {hiveTypeLabels[superItem.type] ?? superItem.type} nastavak
                      </Text>
                      {configuration && (
                        <Text className="text-xs font-bold text-primary">✓ Izabran</Text>
                      )}
                    </View>
                    <Text className="mt-1 text-sm text-muted">
                      Na košnici · {superItem.frameCount}{' '}
                      {superItem.frameCount === 1 ? 'ram' : 'ramova'} · Od{' '}
                      {formatDate(superItem.startedOn)}
                    </Text>
                    {configuration && (
                      <Text className="mt-2 text-sm font-semibold text-primary">
                        {configuration.operation === 'removeForHarvest'
                          ? `Za vrcanje · ${configuration.harvestableFrameCount} ramova`
                          : 'Arhiviraj'}
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {error && <Text className="mt-3 text-sm text-error">{error}</Text>}
      {selectedCount > 0 && (
        <Text className="mt-3 text-sm font-semibold text-muted">Izabrano: {selectedCount}</Text>
      )}
      <FormActions
        primaryLabel={
          selectedCount === 1 ? 'Ukloni nastavak' : `Ukloni nastavke (${selectedCount})`
        }
        pendingLabel="Uklanjanje..."
        disabled={selectedCount === 0}
        isPending={isPending}
        onPrimary={onSubmit}
        onCancel={onCancel}
      />
    </View>
  );
}

function RemoveSuperModal({
  superItem,
  visible,
  onClose,
  onConfirm,
}: {
  superItem: HiveSuper | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (configuration: RemovalConfiguration) => void;
}) {
  const [operation, setOperation] = useState<HiveSuperOperation | null>(null);
  const [harvestableFrameCount, setHarvestableFrameCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOperation(null);
    setHarvestableFrameCount(null);
    setError(null);
    onClose();
  };

  const confirm = () => {
    if (!operation) {
      setError('Izaberite način uklanjanja nastavka.');
      return;
    }
    if (operation === 'removeForHarvest') {
      if (!harvestableFrameCount || harvestableFrameCount <= 0) {
        setError('Unesite broj ramova za vrcanje veći od nule.');
        return;
      }
      if (superItem && harvestableFrameCount > superItem.frameCount) {
        setError(`Broj ramova za vrcanje ne može biti veći od ${superItem.frameCount}.`);
        return;
      }
    }
    onConfirm({
      operation,
      harvestableFrameCount: operation === 'removeForHarvest' ? harvestableFrameCount : null,
    });
    setOperation(null);
    setHarvestableFrameCount(null);
    setError(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="rounded-t-3xl bg-surface px-5 pb-8 pt-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">Ukloni nastavak</Text>
              {superItem && (
                <Text className="mt-1 text-sm text-muted">
                  {hiveTypeLabels[superItem.type] ?? superItem.type} · {superItem.frameCount} ramova
                </Text>
              )}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Zatvori"
              onPress={close}
              className="min-h-11 justify-center px-2"
            >
              <Text className="font-semibold text-primary">Zatvori</Text>
            </Pressable>
          </View>

          <Text className="mb-2 mt-5 text-sm font-semibold text-foreground">Način uklanjanja</Text>
          <View className="flex-row gap-2">
            <ChoiceButton
              active={operation === 'removeForHarvest'}
              onPress={() => {
                setOperation('removeForHarvest');
                setError(null);
              }}
              label="Za vrcanje"
            />
            <ChoiceButton
              active={operation === 'removeAndArchive'}
              onPress={() => {
                setOperation('removeAndArchive');
                setHarvestableFrameCount(null);
                setError(null);
              }}
              label="Arhiviraj"
            />
          </View>

          {operation === 'removeForHarvest' && (
            <View className="mt-5">
              <CountField
                label="Ramovi za vrcanje"
                value={harvestableFrameCount}
                onChange={(value) => {
                  setHarvestableFrameCount(value);
                  setError(null);
                }}
                maximum={superItem?.frameCount ?? 32767}
              />
            </View>
          )}
          {operation === 'removeAndArchive' && (
            <Text className="mt-4 text-sm leading-5 text-muted">
              Nastavak će biti arhiviran bez unosa broja ramova za vrcanje.
            </Text>
          )}
          {error && <Text className="mt-3 text-sm text-error">{error}</Text>}

          <Pressable
            accessibilityRole="button"
            onPress={confirm}
            className="mt-6 min-h-14 items-center justify-center rounded-2xl bg-primary px-5"
          >
            <Text className="text-base font-bold text-background">Potvrdi izbor</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ChoiceButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`min-h-12 flex-1 items-center justify-center rounded-2xl border px-3 ${active ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
    >
      <Text className={`font-bold ${active ? 'text-primary' : 'text-foreground'}`}>{label}</Text>
    </Pressable>
  );
}

function FormActions({
  primaryLabel,
  pendingLabel,
  disabled = false,
  isPending,
  onPrimary,
  onCancel,
}: {
  primaryLabel: string;
  pendingLabel: string;
  disabled?: boolean;
  isPending: boolean;
  onPrimary: () => void;
  onCancel: () => void;
}) {
  return (
    <View className="mt-6 gap-3">
      <Pressable
        accessibilityRole="button"
        disabled={disabled || isPending}
        onPress={onPrimary}
        className={`min-h-14 items-center justify-center rounded-2xl bg-primary px-5 ${disabled || isPending ? 'opacity-50' : ''}`}
      >
        {isPending ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color={colors.onPrimary} />
            <Text className="text-base font-bold text-background">{pendingLabel}</Text>
          </View>
        ) : (
          <Text className="text-base font-bold text-background">{primaryLabel}</Text>
        )}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={isPending}
        onPress={onCancel}
        className={`min-h-12 items-center justify-center rounded-2xl border border-border bg-surface px-5 ${isPending ? 'opacity-50' : ''}`}
      >
        <Text className="font-semibold text-foreground">Otkaži i poništi radnju</Text>
      </Pressable>
    </View>
  );
}

function applyAddServerValidationErrors(
  error: unknown,
  setError: UseFormSetError<AddHiveSupersFormValues>,
) {
  if (!(error instanceof ApiError) || !error.problem?.errors) return false;
  let applied = false;
  Object.entries(error.problem.errors).forEach(([name, messages]) => {
    const match = /^supers\[(\d+)]\.(frameCount|colorHex)$/i.exec(name);
    const field: FieldPath<AddHiveSupersFormValues> | null = match
      ? (`supers.${match[1]}.${match[2]}` as FieldPath<AddHiveSupersFormValues>)
      : name.toLowerCase() === 'supers'
        ? 'superCount'
        : null;
    if (field && messages[0]) {
      setError(field, { type: 'server', message: messages[0] });
      applied = true;
    }
  });
  return applied;
}

function getMutationErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 404)
    return 'Košnica ili izabrani nastavak nisu pronađeni, ili im više nemate pristup.';
  if (error instanceof ApiError && error.status === 409)
    return 'Stanje nastavaka se promenilo. Osvežite podatke i pokušajte ponovo.';
  if (error instanceof ApiError && error.status === 400)
    return 'Proverite podatke i pokušajte ponovo.';
  return 'Radnju nije moguće sačuvati. Pokušajte ponovo.';
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}.${month}.${year}.` : value;
}

function StateScreen({ label, retry }: { label: string; retry?: () => void }) {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-center text-base font-semibold text-muted">{label}</Text>
        {retry && (
          <Pressable
            accessibilityRole="button"
            onPress={retry}
            className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-primary px-5"
          >
            <Text className="font-bold text-background">Pokušaj ponovo</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}
