import {
  zodResolver,
} from '@hookform/resolvers/zod';
import {
  DateTimePicker,
} from '@expo/ui/community/datetime-picker';
import {
  router,
} from 'expo-router';
import {
  useEffect,
  useState,
} from 'react';
import {
  Controller,
  useForm,
  useWatch,
} from 'react-hook-form';
import {
  Alert,
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
  useCurrentColony,
} from '@/features/colonies/hooks/use-current-colony';
import {
  colors,
} from '@/shared/theme/colors';

import {
  QueenMarkingColorPicker,
} from '../components/queen-marking-color-picker';
import {
  useCurrentQueen,
} from '../hooks/use-current-queen';
import {
  useUpdateQueen,
} from '../hooks/use-update-queen';
import {
  updateQueenSchema,
} from '../schemas/update-queen-schema';
import type {
  UpdateQueenFormValues,
} from '../schemas/update-queen-schema';
import type {
  QueenIntroductionOutcome,
  QueenOrigin,
} from '../types/queen';

type EditQueenScreenProps = {
  hiveId: string;
  colonyId: string;
  queenId: string;
};

const originOptions: { label: string; value: QueenOrigin }[] = [
  { label: 'Kupljena', value: 'purchased' },
  { label: 'Odgojena', value: 'produced' },
  { label: 'Nepoznato', value: 'unknown' },
];

const introductionOutcomeOptions: {
  label: string;
  value: QueenIntroductionOutcome;
}[] = [
  { label: 'Prihvaćena', value: 'accepted' },
  { label: 'Ubijena', value: 'killed' },
  { label: 'Nestala', value: 'missing' },
  { label: 'Nije provereno', value: 'unverified' },
  { label: 'Drugo', value: 'other' },
];

function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  return year && month && day
    ? new Date(year, month - 1, day)
    : new Date();
}

function formatDateOnly(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-');

  return year && month && day
    ? `${day}.${month}.${year}.`
    : 'Izaberite datum';
}

function optionalText(value: string) {
  const normalized = value.trim();

  return normalized || null;
}

export function EditQueenScreen({
  hiveId,
  colonyId,
  queenId,
}: EditQueenScreenProps) {
  const colonyQuery = useCurrentColony(hiveId);
  const colony = colonyQuery.data?.id === colonyId
    ? colonyQuery.data
    : null;
  const queenQuery = useCurrentQueen(colony?.id ?? null);
  const queen = queenQuery.data?.id === queenId
    ? queenQuery.data
    : null;
  const updateMutation = useUpdateQueen();

  const {
    control,
    handleSubmit,
    reset,
    formState: {
      errors,
      isDirty,
    },
  } = useForm<UpdateQueenFormValues>({
    resolver: zodResolver(updateQueenSchema),
    defaultValues: {
      markingColorHex: '',
      origin: null,
      breeder: '',
      breed: '',
      emergedOn: '',
      acquiredOn: '',
      introductionOutcome: null,
      notes: '',
    },
  });
  const emergedOn = useWatch({
    control,
    name: 'emergedOn',
  });
  const acquiredOn = useWatch({
    control,
    name: 'acquiredOn',
  });

  useEffect(() => {
    if (!queen) {
      return;
    }

    reset({
      markingColorHex: queen.markingColorHex ?? '',
      origin: queen.origin,
      breeder: queen.breeder ?? '',
      breed: queen.breed ?? '',
      emergedOn: queen.emergedOn ?? '',
      acquiredOn: queen.acquiredOn ?? '',
      introductionOutcome: queen.introductionOutcome,
      notes: queen.notes ?? '',
    });
  }, [queen, reset]);

  const introductionOutcome = queen?.introductionOutcome ?? null;
  const canEditIntroductionOutcome = introductionOutcome === null || [
    'missing',
    'unverified',
    'other',
  ].includes(introductionOutcome);

  const saveChanges = async (values: UpdateQueenFormValues) => {
    try {
      await updateMutation.mutateAsync({
        queenId,
        colonyId,
        request: {
          markingColorHex: optionalText(values.markingColorHex)?.toUpperCase() ?? null,
          origin: values.origin,
          breeder: optionalText(values.breeder),
          breed: optionalText(values.breed),
          emergedOn: optionalText(values.emergedOn),
          acquiredOn: optionalText(values.acquiredOn),
          introductionOutcome:
            canEditIntroductionOutcome
              ? values.introductionOutcome ?? undefined
              : undefined,
          notes: optionalText(values.notes),
        },
      });

      if (values.introductionOutcome === 'killed') {
        router.replace({
          pathname: '/hives/[hiveId]/colonies/[colonyId]',
          params: { hiveId, colonyId },
        } as never);
        return;
      }

      router.back();
    } catch {
      // The recoverable mutation error is shown below the form.
    }
  };

  const onSubmit = (values: UpdateQueenFormValues) => {
    if (values.introductionOutcome !== 'killed') {
      void saveChanges(values);
      return;
    }

    Alert.alert(
      'Potvrdite ishod uvođenja',
      'Da li ste sigurni da je matica ubijena? Ovim uklanjate ovu maticu iz evidencije.',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Da, ubijena je',
          style: 'destructive',
          onPress: () => {
            void saveChanges(values);
          },
        },
      ],
    );
  };

  if (colonyQuery.isLoading || queenQuery.isLoading) {
    return <LoadingState label="Učitavanje matice..." />;
  }

  if (colonyQuery.isError || queenQuery.isError || !colony || !queen) {
    return <LoadError />;
  }

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        <Pressable
          onPress={() => {
            router.back();
          }}
          className="mb-5 self-start py-2"
        >
          <Text className="text-base font-semibold text-primary">← Nazad</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-foreground">Izmeni maticu</Text>
        <Text className="mt-1 text-sm text-muted">
          Izmenite osnovne podatke o matici.
        </Text>

        <SectionTitle>Osnovni podaci</SectionTitle>

        <Controller
          control={control}
          name="markingColorHex"
          render={({ field }) => (
            <QueenMarkingColorPicker
              value={field.value}
              onChange={field.onChange}
              error={errors.markingColorHex?.message}
            />
          )}
        />

        {canEditIntroductionOutcome && (
          <>
            <SectionTitle>Ishod uvođenja</SectionTitle>
            <Controller
              control={control}
              name="introductionOutcome"
              render={({ field }) => (
                <IntroductionOutcomeChoices
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </>
        )}

        <Controller
          control={control}
          name="origin"
          render={({ field }) => (
            <OriginChoices value={field.value} onChange={field.onChange} />
          )}
        />

        <Controller
          control={control}
          name="breeder"
          render={({ field }) => (
            <FormTextInput
              label="Odgajivač"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.breeder?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="breed"
          render={({ field }) => (
            <FormTextInput
              label="Rasa"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.breed?.message}
            />
          )}
        />

        <SectionTitle>Datumi</SectionTitle>

        <Controller
          control={control}
          name="emergedOn"
          render={({ field }) => (
            <DatePickerField
              label="Datum izleganja"
              value={field.value}
              maximumDate={
                acquiredOn
                  ? parseDateOnly(acquiredOn)
                  : undefined
              }
              onChange={field.onChange}
              error={errors.emergedOn?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="acquiredOn"
          render={({ field }) => (
            <DatePickerField
              label="Datum nabavke"
              value={field.value}
              minimumDate={
                emergedOn
                  ? parseDateOnly(emergedOn)
                  : undefined
              }
              onChange={field.onChange}
              error={errors.acquiredOn?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <FormTextInput
              label="Napomena o matici"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.notes?.message}
              multiline
            />
          )}
        />

        {updateMutation.isError && (
          <View className="mb-4 rounded-2xl border border-error/30 bg-surface px-4 py-3">
            <Text className="text-sm text-error">Maticu nije moguće ažurirati. Pokušajte ponovo.</Text>
          </View>
        )}

        <Pressable
          disabled={updateMutation.isPending || !isDirty}
          onPress={handleSubmit(onSubmit)}
          className={`min-h-14 items-center justify-center rounded-2xl bg-primary px-5 ${updateMutation.isPending || !isDirty ? 'opacity-60' : ''}`}
        >
          <Text className="text-base font-bold text-background">
            {updateMutation.isPending ? 'Čuvanje...' : 'Sačuvaj izmene'}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

function DatePickerField({
  label,
  value,
  minimumDate,
  maximumDate,
  onChange,
  error,
}: {
  label: string;
  value: string;
  minimumDate?: Date;
  maximumDate?: Date;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const pickerValue = value ? parseDateOnly(value) : minimumDate ?? maximumDate ?? new Date();

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>
      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Izaberite ${label.toLowerCase()}`}
          onPress={() => {
            setIsPickerVisible(true);
          }}
          className={`min-h-14 flex-1 justify-center rounded-2xl border bg-surface px-4 ${error ? 'border-error' : 'border-border'}`}
        >
          <Text className={`text-base ${value ? 'text-foreground' : 'text-muted'}`}>
            {value ? formatDate(value) : 'Izaberite datum'}
          </Text>
        </Pressable>

        {value && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Obriši ${label.toLowerCase()}`}
            onPress={() => {
              onChange('');
              setIsPickerVisible(false);
            }}
            className="min-h-14 items-center justify-center rounded-2xl border border-border bg-surface px-4"
          >
            <Text className="font-semibold text-muted">Obriši</Text>
          </Pressable>
        )}
      </View>

      {isPickerVisible && (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          accentColor={colors.primary}
          onDismiss={() => {
            setIsPickerVisible(false);
          }}
          onValueChange={(_event, date) => {
            onChange(formatDateOnly(date));
            setIsPickerVisible(false);
          }}
        />
      )}

      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
}

function OriginChoices({
  value,
  onChange,
}: {
  value: QueenOrigin | null;
  onChange: (value: QueenOrigin | null) => void;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">Poreklo</Text>
      <View className="flex-row gap-2">
        {originOptions.map((option) => {
          const isSelected = value === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                onChange(isSelected ? null : option.value);
              }}
              className={`min-h-12 flex-1 items-center justify-center rounded-2xl border px-3 ${isSelected ? 'border-primary bg-primary' : 'border-border bg-surface'}`}
            >
              <Text className={`font-semibold ${isSelected ? 'text-background' : 'text-foreground'}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function IntroductionOutcomeChoices({
  value,
  onChange,
}: {
  value: QueenIntroductionOutcome | null;
  onChange: (value: QueenIntroductionOutcome) => void;
}) {
  return (
    <View className="mb-4 gap-2">
      <Text className="text-sm text-muted">
        Dopunite ishod kada je provereno stanje matice.
      </Text>
      {introductionOutcomeOptions.map((option) => {
        const isSelected = value === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            onPress={() => {
              onChange(option.value);
            }}
            className={`min-h-12 flex-row items-center rounded-2xl border px-4 ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-surface'}`}
          >
            <View
              className={`mr-3 h-5 w-5 rounded-full border-2 ${isSelected ? 'border-primary bg-primary' : 'border-muted'}`}
            />
            <Text className="font-semibold text-foreground">{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FormTextInput({
  label,
  value,
  onChangeText,
  error,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  multiline?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholderTextColor={colors.muted}
        className={`rounded-2xl border bg-surface px-4 text-base text-foreground ${multiline ? 'min-h-32 py-3' : 'h-14'} ${error ? 'border-error' : 'border-border'}`}
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
      <Text className="text-center text-base font-semibold text-error">Nije moguće učitati podatke o matici.</Text>
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text className="mb-3 mt-8 text-lg font-bold text-foreground">{children}</Text>;
}
