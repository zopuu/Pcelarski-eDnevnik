import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm, type FieldPath } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import {
  EnumChoiceField,
  FormTextInput,
} from '@/features/hive-inspections/components/inspection-form-controls';
import { useHive } from '@/features/hives/hooks/use-hive';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { ApiError } from '@/shared/api/api-error';
import { DatePickerField } from '@/shared/components/date-picker-field';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';
import { formatDateOnly } from '@/shared/utils/date-only';

import { useRecordHiveMaintenance } from '../hooks/use-record-hive-maintenance';
import {
  recordHiveMaintenanceSchema,
  type RecordHiveMaintenanceFormValues,
} from '../schemas/record-hive-maintenance-schema';
import { hiveMaintenanceTypes, type RecordHiveMaintenanceRequest } from '../types/hive-maintenance';
import { getMaintenanceTypeLabel } from '../utils/maintenance-labels';

const today = formatDateOnly(new Date());
const defaultValues: RecordHiveMaintenanceFormValues = {
  performedOn: today,
  maintenanceType: 'REPAIR',
  costAmount: '',
  currencyCode: null,
  serviceProvider: '',
  notes: '',
};

export function RecordHiveMaintenanceScreen({ hiveId }: { hiveId: string }) {
  const { openDrawer } = useAppDrawer();
  const hiveQuery = useHive(hiveId);
  const mutation = useRecordHiveMaintenance();
  const [isMaintenanceTypePickerOpen, setIsMaintenanceTypePickerOpen] = useState(false);
  const { control, handleSubmit, clearErrors, setError } = useForm<RecordHiveMaintenanceFormValues>(
    {
      resolver: zodResolver(recordHiveMaintenanceSchema),
      defaultValues,
    },
  );

  const onSubmit = async (values: RecordHiveMaintenanceFormValues) => {
    clearErrors();
    try {
      await mutation.mutateAsync(toRequest(hiveId, values));
      Keyboard.dismiss();
      Alert.alert('Održavanje je sačuvano', 'Podaci o održavanju košnice su evidentirani.', [
        {
          text: 'U redu',
          onPress: () =>
            router.replace({
              pathname: '/hives/[hiveId]',
              params: { hiveId },
            } as never),
        },
      ]);
    } catch (error) {
      if (!applyServerValidationErrors(error, setError)) {
        Alert.alert('Održavanje nije sačuvano', getMutationErrorMessage(error));
      }
    }
  };

  if (hiveQuery.isLoading) return <StateScreen label="Učitavanje košnice..." />;
  if (hiveQuery.isError || !hiveQuery.data) {
    return (
      <StateScreen
        label="Nije moguće učitati podatke o košnici."
        retry={() => void hiveQuery.refetch()}
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
        <Text className="text-2xl font-bold text-foreground">Održavanje košnice</Text>
        <Text className="mt-1 text-sm leading-5 text-muted">
          Evidentirajte radove izvedene na košnici {hiveQuery.data.label}.
        </Text>

        <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Podaci o održavanju</Text>
        <View className="rounded-3xl border border-border bg-surface px-5 pb-1 pt-5">
          <Controller
            control={control}
            name="performedOn"
            render={({ field, fieldState }) => (
              <DatePickerField
                label="Datum održavanja"
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
            name="maintenanceType"
            render={({ field, fieldState }) => (
              <MaintenanceTypeCombobox
                value={field.value}
                visible={isMaintenanceTypePickerOpen}
                onOpen={() => setIsMaintenanceTypePickerOpen(true)}
                onClose={() => setIsMaintenanceTypePickerOpen(false)}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="serviceProvider"
            render={({ field, fieldState }) => (
              <FormTextInput
                label="Izvršilac radova"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Naziv majstora ili servisa"
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
                placeholder="Dodatne informacije o održavanju"
                multiline
                error={fieldState.error?.message}
              />
            )}
          />
        </View>

        <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Trošak</Text>
        <View className="rounded-3xl border border-border bg-surface px-5 pb-1 pt-5">
          <Controller
            control={control}
            name="costAmount"
            render={({ field, fieldState }) => (
              <FormTextInput
                label="Iznos"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Na primer 1.250,00"
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="currencyCode"
            render={({ field, fieldState }) => (
              <EnumChoiceField
                label="Valuta"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'RSD', label: 'RSD' },
                  { value: 'EUR', label: 'EUR' },
                ]}
                error={fieldState.error?.message}
              />
            )}
          />
          <Text className="-mt-2 mb-5 text-xs leading-4 text-muted">
            Iznos i valuta se unose zajedno. Izaberite RSD ili EUR, ili ostavite oba polja prazna.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={mutation.isPending}
          onPress={handleSubmit(onSubmit)}
          className={`mt-7 min-h-14 items-center justify-center rounded-2xl bg-primary px-5 ${mutation.isPending ? 'opacity-60' : ''}`}
        >
          {mutation.isPending ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color={colors.onPrimary} />
              <Text className="text-base font-bold text-background">Čuvanje...</Text>
            </View>
          ) : (
            <Text className="text-base font-bold text-background">Sačuvaj održavanje</Text>
          )}
        </Pressable>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

function toRequest(
  hiveId: string,
  values: RecordHiveMaintenanceFormValues,
): RecordHiveMaintenanceRequest {
  const [year, month, day] = values.performedOn.split('-').map(Number);
  return {
    hiveId,
    performedAt:
      values.performedOn === today
        ? new Date().toISOString()
        : new Date(year, month - 1, day, 12).toISOString(),
    maintenanceType: values.maintenanceType,
    costAmount: values.costAmount ? Number(values.costAmount.replace(',', '.')) : null,
    currencyCode: values.currencyCode,
    serviceProvider: optionalText(values.serviceProvider),
    imageUrl: null,
    notes: optionalText(values.notes),
  };
}

function optionalText(value: string) {
  return value.trim() || null;
}

function MaintenanceTypeCombobox({
  value,
  visible,
  onOpen,
  onClose,
  onChange,
  error,
}: {
  value: RecordHiveMaintenanceFormValues['maintenanceType'];
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
  onChange: (value: RecordHiveMaintenanceFormValues['maintenanceType']) => void;
  error?: string;
}) {
  const [query, setQuery] = useState('');
  const options = useMemo(
    () =>
      hiveMaintenanceTypes.filter((type) =>
        getMaintenanceTypeLabel(type)
          .toLocaleLowerCase('sr-Latn-RS')
          .includes(query.trim().toLocaleLowerCase('sr-Latn-RS')),
      ),
    [query],
  );

  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-foreground">Vrsta održavanja</Text>
      <Pressable
        accessibilityRole="combobox"
        accessibilityLabel="Vrsta održavanja"
        accessibilityState={{ expanded: visible }}
        onPress={onOpen}
        className={`min-h-14 flex-row items-center justify-between rounded-2xl border bg-background px-4 ${error ? 'border-error' : 'border-border'}`}
      >
        <Text className="text-base text-foreground">{getMaintenanceTypeLabel(value)}</Text>
        <Text className="text-xl text-muted">⌄</Text>
      </Pressable>
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}

      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[80%] rounded-t-3xl bg-surface px-5 pb-8 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Vrsta održavanja</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Zatvori izbor vrste održavanja"
                onPress={onClose}
                className="min-h-11 justify-center px-2"
              >
                <Text className="font-semibold text-primary">Zatvori</Text>
              </Pressable>
            </View>
            <TextInput
              accessibilityLabel="Pretraži vrste održavanja"
              value={query}
              onChangeText={setQuery}
              placeholder="Pretraži"
              placeholderTextColor={colors.muted}
              selectionColor={colors.primary}
              className="mb-3 h-14 rounded-2xl border border-border bg-background px-4 text-base text-foreground"
            />
            {options.map((type) => (
              <Pressable
                key={type}
                accessibilityRole="button"
                accessibilityState={{ selected: value === type }}
                onPress={() => {
                  onChange(type);
                  setQuery('');
                  onClose();
                }}
                className={`min-h-12 justify-center border-b border-border py-3 ${value === type ? 'bg-primary/10' : ''}`}
              >
                <Text
                  className={`text-base font-semibold ${value === type ? 'text-primary' : 'text-foreground'}`}
                >
                  {getMaintenanceTypeLabel(type)}
                </Text>
              </Pressable>
            ))}
            {options.length === 0 && (
              <Text className="py-5 text-center text-sm text-muted">
                Nema odgovarajuće vrste održavanja.
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function applyServerValidationErrors(
  error: unknown,
  setError: (
    name: FieldPath<RecordHiveMaintenanceFormValues>,
    error: { type: string; message: string },
  ) => void,
) {
  if (!(error instanceof ApiError) || !error.problem?.errors) return false;
  for (const [serverName, messages] of Object.entries(error.problem.errors)) {
    const candidate =
      serverName.toLowerCase() === 'performedat'
        ? 'performedOn'
        : `${serverName.charAt(0).toLowerCase()}${serverName.slice(1)}`;
    if (candidate in defaultValues && messages[0])
      setError(candidate as FieldPath<RecordHiveMaintenanceFormValues>, {
        type: 'server',
        message: messages[0],
      });
  }
  return true;
}

function getMutationErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 404)
    return 'Košnica nije pronađena ili joj više nemate pristup.';
  if (error instanceof ApiError && error.status === 400)
    return 'Proverite označena polja i pokušajte ponovo.';
  return error instanceof Error
    ? error.message
    : 'Održavanje nije moguće sačuvati. Pokušajte ponovo.';
}

function StateScreen({ label, retry }: { label: string; retry?: () => void }) {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-center text-base font-semibold text-muted">{label}</Text>
        {retry && (
          <Pressable
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
