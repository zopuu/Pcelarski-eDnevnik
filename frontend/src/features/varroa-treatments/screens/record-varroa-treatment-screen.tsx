import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm, Controller, useWatch, type Control, type UseFormSetError } from 'react-hook-form';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import {
  EnumChoiceField,
  FormTextInput,
} from '@/features/hive-inspections/components/inspection-form-controls';
import { useHive } from '@/features/hives/hooks/use-hive';
import { useHives } from '@/features/hives/hooks/use-hives';
import { HiveCard } from '@/features/hives/components/hive-card';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { ApiError } from '@/shared/api/api-error';
import { ContextualActionBar } from '@/shared/components/contextual-action-bar/contextual-action-bar';
import { DatePickerField } from '@/shared/components/date-picker-field';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';
import { formatDateOnly } from '@/shared/utils/date-only';

import { useRecordVarroaTreatment } from '../hooks/use-record-varroa-treatment';
import {
  recordVarroaTreatmentSchema,
  type RecordVarroaTreatmentFormValues,
} from '../schemas/record-varroa-treatment-schema';
import type {
  RecordVarroaTreatmentRequest,
  VarroaApplicationMethod,
  VarroaDoseUnit,
} from '../types/varroa-treatment';

type RecordVarroaTreatmentScreenProps =
  | {
      apiaryId: string;
      hiveId?: never;
    }
  | {
      hiveId: string;
      apiaryId?: never;
    };

const applicationMethodOptions: readonly {
  value: VarroaApplicationMethod;
  label: string;
}[] = [
  { value: 'strips', label: 'Trake' },
  { value: 'fumigation', label: 'Dimljenje' },
  { value: 'trickling', label: 'Nakapavanje' },
  { value: 'vaporization', label: 'Isparavanje' },
  { value: 'spraying', label: 'Prskanje' },
  { value: 'other', label: 'Drugo' },
];

const doseUnitOptions: readonly {
  value: VarroaDoseUnit;
  label: string;
}[] = [
  { value: 'ml', label: 'ml' },
  { value: 'strips', label: 'trake' },
  { value: 'g', label: 'g' },
];

const today = formatDateOnly(new Date());

export function RecordVarroaTreatmentScreen(props: RecordVarroaTreatmentScreenProps) {
  const { openDrawer } = useAppDrawer();
  const hiveId = props.hiveId ?? '';
  const apiaryId = props.apiaryId ?? '';
  const isSingleHive = hiveId.length > 0;
  const apiaryHivesQuery = useHives(apiaryId);
  const hiveQuery = useHive(hiveId);
  const mutation = useRecordVarroaTreatment();
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<RecordVarroaTreatmentFormValues>({
    resolver: zodResolver(recordVarroaTreatmentSchema),
    defaultValues: {
      performedOn: today,
      productName: '',
      applicationMethod: 'trickling',
      doseAmount: '',
      doseUnit: 'ml',
      notes: '',
      selectedHiveIds: isSingleHive ? [hiveId] : [],
    },
  });
  const selectedHiveIds = useWatch({
    control,
    name: 'selectedHiveIds',
  });

  const isLoadingHives = isSingleHive ? hiveQuery.isLoading : apiaryHivesQuery.isLoading;
  const hasHiveError = isSingleHive
    ? hiveQuery.isError || !hiveQuery.data
    : apiaryHivesQuery.isError || !apiaryHivesQuery.data;
  const selectableHives = isSingleHive
    ? hiveQuery.data
      ? [hiveQuery.data]
      : []
    : (apiaryHivesQuery.data ?? []).filter((hive) => hive.status === 'active');

  const onSubmit = async (values: RecordVarroaTreatmentFormValues) => {
    try {
      const response = await mutation.mutateAsync(toRequest(values));
      const hiveWord = response.affectedHiveCount === 1 ? 'košnicu' : 'košnice';

      Alert.alert(
        'Tretman je evidentiran',
        `Tretman protiv varoe je sačuvan za ${response.affectedHiveCount} ${hiveWord}.`,
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

      Alert.alert('Tretman nije sačuvan', getMutationErrorMessage(error));
    }
  };

  const toggleHive = (selectedHiveId: string) => {
    if (isSingleHive) {
      return;
    }

    const nextHiveIds = selectedHiveIds.includes(selectedHiveId)
      ? selectedHiveIds.filter((id) => id !== selectedHiveId)
      : [...selectedHiveIds, selectedHiveId];

    setValue('selectedHiveIds', nextHiveIds, {
      shouldValidate: true,
    });
  };

  if (isLoadingHives) {
    return <LoadingState label="Učitavanje košnica..." />;
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
    <Screen
      header={<AppHeader onMenuPress={openDrawer} />}
      contextualActionBar={
        <ContextualActionBar
          leftActions={[
            {
              key: 'cancel',
              label: 'Otkaži',
              icon: 'close-outline',
              variant: 'danger',
              accessibilityLabel: 'Otkaži unos tretmana protiv varoe',
              onPress: () => router.back(),
              disabled: mutation.isPending,
            },
          ]}
          primaryAction={{
            key: 'save',
            label: 'Sačuvaj',
            icon: 'checkmark',
            accessibilityLabel: 'Sačuvaj tretman protiv varoe',
            onPress: () => {
              void handleSubmit(onSubmit)();
            },
            disabled: mutation.isPending,
            loading: mutation.isPending,
          }}
        />
      }
    >
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

        <Text className="text-2xl font-bold text-foreground">Tretman protiv varoe</Text>
        <Text className="mt-1 text-sm leading-5 text-muted">
          Unesite preparat i dozu, a zatim označite košnice koje tretirate.
        </Text>

        <View className="mt-7 rounded-3xl border border-border bg-surface px-5 pt-5">
          <Controller
            control={control}
            name="performedOn"
            render={({ field }) => (
              <DatePickerField
                label="Datum tretmana *"
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
            name="productName"
            render={({ field }) => (
              <FormTextInput
                label="Naziv preparata *"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Na primer Api-Bioxal"
                error={errors.productName?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="applicationMethod"
            render={({ field }) => (
              <EnumChoiceField
                label="Način primene *"
                value={field.value}
                onChange={field.onChange}
                options={applicationMethodOptions}
                error={errors.applicationMethod?.message}
              />
            )}
          />
          <DoseAmountField control={control} error={errors.doseAmount?.message} />
          <Controller
            control={control}
            name="doseUnit"
            render={({ field }) => (
              <EnumChoiceField
                label="Jedinica doze *"
                value={field.value}
                onChange={field.onChange}
                options={doseUnitOptions}
                error={errors.doseUnit?.message}
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
                placeholder="Dodatne informacije o tretmanu"
                multiline
                error={errors.notes?.message}
              />
            )}
          />
        </View>

        <Text className="mb-2 mt-7 text-lg font-bold text-foreground">
          {isSingleHive ? 'Košnica za tretman' : 'Košnice za tretman'}
        </Text>
        <Text className="mb-4 text-sm leading-5 text-muted">
          {isSingleHive
            ? 'Tretman će biti evidentiran samo za ovu košnicu.'
            : 'Izaberite najmanje jednu aktivnu košnicu.'}
        </Text>

        {selectableHives.length === 0 ? (
          <EmptyState />
        ) : (
          <View className="gap-3">
            {selectableHives.map((hive) => (
              <HiveCard
                key={hive.id}
                label={hive.label}
                identificationNumber={hive.identificationNumber}
                type={hive.type}
                colorHex={hive.colorHex}
                status={hive.status}
                selectionMode
                selected={selectedHiveIds.includes(hive.id)}
                onPress={() => toggleHive(hive.id)}
              />
            ))}
          </View>
        )}

        {errors.selectedHiveIds?.message && (
          <Text className="mt-2 text-sm text-error">{errors.selectedHiveIds.message}</Text>
        )}
      </KeyboardAwareScrollView>
    </Screen>
  );
}

function DoseAmountField({
  control,
  error,
}: {
  control: Control<RecordVarroaTreatmentFormValues>;
  error?: string;
}) {
  return (
    <Controller
      control={control}
      name="doseAmount"
      render={({ field }) => (
        <View className="mb-5">
          <Text className="mb-2 text-sm font-semibold text-foreground">Doza *</Text>
          <TextInput
            accessibilityLabel="Doza"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="Na primer 5"
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            keyboardType="decimal-pad"
            inputMode="decimal"
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

function toRequest(values: RecordVarroaTreatmentFormValues): RecordVarroaTreatmentRequest {
  return {
    performedAt: toPerformedAt(values.performedOn),
    productName: values.productName.trim(),
    applicationMethod: values.applicationMethod,
    doseAmount: Number(values.doseAmount.replace(',', '.')),
    doseUnit: values.doseUnit,
    imageUrl: null,
    notes: optionalText(values.notes),
    hiveIds: values.selectedHiveIds,
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
  setError: UseFormSetError<RecordVarroaTreatmentFormValues>,
) {
  if (!(error instanceof ApiError) || !error.problem?.errors) {
    return false;
  }

  const fieldMap: Record<string, keyof RecordVarroaTreatmentFormValues> = {
    performedAt: 'performedOn',
    productName: 'productName',
    applicationMethod: 'applicationMethod',
    doseAmount: 'doseAmount',
    doseUnit: 'doseUnit',
    notes: 'notes',
    hiveIds: 'selectedHiveIds',
  };
  let hasFieldError = false;

  Object.entries(error.problem.errors).forEach(([key, messages]) => {
    const field = fieldMap[key.charAt(0).toLowerCase() + key.slice(1)];

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

  if (error instanceof ApiError && error.status === 400) {
    return 'Proverite označena polja i pokušajte ponovo.';
  }

  return error instanceof Error ? error.message : 'Tretman nije moguće sačuvati. Pokušajte ponovo.';
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
        Nije moguće učitati košnice za tretman.
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
        Tretman se može evidentirati samo za aktivnu košnicu.
      </Text>
    </View>
  );
}
