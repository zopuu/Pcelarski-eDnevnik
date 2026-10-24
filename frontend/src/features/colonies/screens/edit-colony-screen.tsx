import { zodResolver } from '@hookform/resolvers/zod';

import { DateTimePicker } from '@expo/ui/community/datetime-picker';

import { router } from 'expo-router';

import { useEffect, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';

import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { useCurrentColony } from '../hooks/use-current-colony';
import { useUpdateColony } from '../hooks/use-update-colony';
import { updateColonySchema } from '../schemas/update-colony-schema';
import type { UpdateColonyFormValues } from '../schemas/update-colony-schema';
import type { ColonyOrigin } from '../types/colony';

import { colors } from '@/shared/theme/colors';

type EditColonyScreenProps = {
  hiveId: string;
  colonyId: string;
};

const originOptions: {
  label: string;
  value: ColonyOrigin;
}[] = [
  {
    label: 'Roj',
    value: 'swarm',
  },
  {
    label: 'Kupljeno',
    value: 'purchased',
  },
  {
    label: 'Podelom',
    value: 'split',
  },
];

function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
}

function formatDateOnly(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-');

  return year && month && day ? `${day}.${month}.${year}.` : 'Izaberite datum';
}

function optionalText(value: string): string | null {
  const normalized = value.trim();

  return normalized || null;
}

export function EditColonyScreen({ hiveId, colonyId }: EditColonyScreenProps) {
  const colonyQuery = useCurrentColony(hiveId);
  const colony = colonyQuery.data?.id === colonyId ? colonyQuery.data : null;
  const updateMutation = useUpdateColony();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateColonyFormValues>({
    resolver: zodResolver(updateColonySchema),
    defaultValues: {
      origin: null,
      formedOn: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!colony) {
      return;
    }

    reset({
      origin: colony.origin,
      formedOn: colony.formedOn ?? '',
      notes: colony.notes ?? '',
    });
  }, [colony, reset]);

  const onSubmit = async (values: UpdateColonyFormValues) => {
    try {
      await updateMutation.mutateAsync({
        colonyId,
        hiveId,
        request: {
          origin: values.origin,
          formedOn: optionalText(values.formedOn),
          notes: optionalText(values.notes),
        },
      });

      router.back();
    } catch {
      // The recoverable mutation error is shown below the form.
    }
  };

  if (colonyQuery.isLoading) {
    return <LoadingState label="Učitavanje društva..." />;
  }

  if (colonyQuery.isError || !colony) {
    return <LoadError />;
  }

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
          <Text className="text-base font-semibold text-primary">← Nazad</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-foreground">Izmeni društvo</Text>

        <Text className="mt-1 text-sm text-muted">
          Izmenite osnovne podatke o pčelinjem društvu.
        </Text>

        <SectionTitle>Osnovni podaci</SectionTitle>

        <Controller
          control={control}
          name="origin"
          render={({ field }) => (
            <ChoiceGroup label="Poreklo" value={field.value} onChange={field.onChange} />
          )}
        />

        <Controller
          control={control}
          name="formedOn"
          render={({ field }) => (
            <DatePickerField
              label="Datum formiranja"
              value={field.value}
              maximumDate={parseDateOnly(colony.startedOn)}
              onChange={field.onChange}
              error={errors.formedOn?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <NotesInput
              value={field.value}
              onChangeText={field.onChange}
              error={errors.notes?.message}
            />
          )}
        />

        {updateMutation.isError && (
          <View className="mb-4 rounded-2xl border border-error/30 bg-surface px-4 py-3">
            <Text className="text-sm text-error">
              Društvo nije moguće ažurirati. Pokušajte ponovo.
            </Text>
          </View>
        )}

        <Pressable
          disabled={updateMutation.isPending || !isDirty}
          onPress={handleSubmit(onSubmit)}
          className={`
            min-h-14
            items-center
            justify-center
            rounded-2xl
            bg-primary
            px-5
            ${updateMutation.isPending || !isDirty ? 'opacity-60' : ''}
          `}
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
  maximumDate,
  onChange,
  error,
}: {
  label: string;
  value: string;
  maximumDate: Date;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const pickerValue = value ? parseDateOnly(value) : maximumDate;

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>

      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Izaberite datum formiranja"
          onPress={() => {
            setIsPickerVisible(true);
          }}
          className={`
            min-h-14
            flex-1
            justify-center
            rounded-2xl
            border
            bg-surface
            px-4
            ${error ? 'border-error' : 'border-border'}
          `}
        >
          <Text className={`text-base ${value ? 'text-foreground' : 'text-muted'}`}>
            {value ? formatDate(value) : 'Izaberite datum'}
          </Text>
        </Pressable>

        {value && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Obriši datum formiranja"
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

function ChoiceGroup({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ColonyOrigin | null;
  onChange: (value: ColonyOrigin | null) => void;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>

      <View className="flex-row flex-wrap gap-2">
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
              className={`
                min-h-12
                flex-1
                items-center
                justify-center
                rounded-2xl
                border
                px-3
                ${isSelected ? 'border-primary bg-primary' : 'border-border bg-surface'}
              `}
            >
              <Text
                className={`font-semibold ${isSelected ? 'text-background' : 'text-foreground'}`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function NotesInput({
  value,
  onChangeText,
  error,
}: {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">Napomena o društvu</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
        placeholder="Dodajte napomenu..."
        placeholderTextColor={colors.muted}
        className={`
          min-h-32
          rounded-2xl
          border
          bg-surface
          px-4
          py-3
          text-base
          text-foreground
          ${error ? 'border-error' : 'border-border'}
        `}
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
        Nije moguće učitati podatke o društvu.
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text className="mb-3 mt-8 text-lg font-bold text-foreground">{children}</Text>;
}
