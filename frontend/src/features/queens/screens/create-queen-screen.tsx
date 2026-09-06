import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  router,
} from 'expo-router';

import {
  Controller,
  useForm,
  useWatch,
} from 'react-hook-form';

import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

import {
  QueenMarkingColorPicker,
} from '../components/queen-marking-color-picker';
import {
  useCreateQueen,
} from '../hooks/use-create-queen';
import {
  createQueenSchema,
} from '../schemas/create-queen-schema';
import type {
  CreateQueenFormInput,
  CreateQueenFormValues,
} from '../schemas/create-queen-schema';
import type {
  CreateQueenRequest,
} from '../types/create-queen';
import type {
  QueenIntroductionMethod,
  QueenIntroductionOutcome,
  QueenOrigin,
} from '../types/queen';

import {
  DatePickerField,
} from '@/shared/components/date-picker-field';
import {
  colors,
} from '@/shared/theme/colors';
import {
  getCurrentUtcDateOnly,
} from '@/shared/utils/date-only';

type CreateQueenScreenProps = {
  hiveId: string;
  colonyId: string;
};

function optionalText(value: string): string | null {
  const normalized = value.trim();

  return normalized || null;
}

export function CreateQueenScreen({
  hiveId,
  colonyId,
}: CreateQueenScreenProps) {
  const mutation = useCreateQueen(colonyId);
  const today = getCurrentUtcDateOnly();
  const {
    control,
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm<
    CreateQueenFormInput,
    unknown,
    CreateQueenFormValues
  >({
    resolver: zodResolver(createQueenSchema),
    defaultValues: {
      markingColorHex: '',
      origin: null,
      breeder: '',
      breed: '',
      emergedOn: '',
      acquiredOn: '',
      notes: '',
      startedOn: today,
      introductionMethod: null,
      introductionOutcome: null,
      stayNotes: '',
    },
  });

  const emergedOn = useWatch({ control, name: 'emergedOn' });
  const acquiredOn = useWatch({ control, name: 'acquiredOn' });

  const onSubmit = async (values: CreateQueenFormValues) => {
    const request: CreateQueenRequest = {
      markingColorHex: optionalText(values.markingColorHex)?.toUpperCase() ?? null,
      origin: values.origin,
      breeder: optionalText(values.breeder),
      breed: optionalText(values.breed),
      emergedOn: optionalText(values.emergedOn),
      acquiredOn: optionalText(values.acquiredOn),
      notes: optionalText(values.notes),
      startedOn: values.startedOn,
      introductionMethod: values.introductionMethod,
      introductionOutcome: values.introductionOutcome,
      stayNotes: optionalText(values.stayNotes),
    };

    try {
      const response = await mutation.mutateAsync(request);

      router.replace({
        pathname: '/hives/[hiveId]/colonies/[colonyId]/queens/[queenId]',
        params: {
          hiveId,
          colonyId,
          queenId: response.queenId,
        },
      } as never);
    } catch {
      // The recoverable API error is rendered below without clearing the form.
    }
  };

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

        <Text className="text-2xl font-bold text-foreground">Nova matica</Text>
        <Text className="mt-1 text-sm text-muted">
          Evidentirajte maticu i njen početak boravka u društvu.
        </Text>

        <SectionTitle>Podaci o matici</SectionTitle>

        <Controller control={control} name="origin" render={({ field }) => (
          <ChoiceGroup
            label="Poreklo *"
            value={field.value}
            onChange={field.onChange}
            error={errors.origin?.message}
            options={[
              { value: 'purchased', label: 'Kupljena' },
              { value: 'produced', label: 'Odgojena' },
              { value: 'unknown', label: 'Nepoznato' },
            ] as { value: QueenOrigin; label: string }[]}
          />
        )} />

        <Controller control={control} name="markingColorHex" render={({ field }) => (
          <QueenMarkingColorPicker
            value={field.value}
            onChange={field.onChange}
            error={errors.markingColorHex?.message}
          />
        )} />

        <Controller control={control} name="breed" render={({ field }) => (
          <FormInput label="Rasa" value={field.value} onChangeText={field.onChange} error={errors.breed?.message} />
        )} />
        <Controller control={control} name="breeder" render={({ field }) => (
          <FormInput label="Odgajivač" value={field.value} onChangeText={field.onChange} error={errors.breeder?.message} />
        )} />
        <Controller control={control} name="emergedOn" render={({ field }) => (
          <DatePickerField
            label="Datum izleganja"
            value={field.value}
            onChange={field.onChange}
            maximumDate={acquiredOn && acquiredOn < today ? acquiredOn : today}
            error={errors.emergedOn?.message}
          />
        )} />
        <Controller control={control} name="acquiredOn" render={({ field }) => (
          <DatePickerField
            label="Datum nabavke"
            value={field.value}
            onChange={field.onChange}
            minimumDate={emergedOn || undefined}
            maximumDate={today}
            error={errors.acquiredOn?.message}
          />
        )} />
        <Controller control={control} name="notes" render={({ field }) => (
          <FormInput label="Napomena o matici" value={field.value} onChangeText={field.onChange} error={errors.notes?.message} multiline />
        )} />

        <SectionTitle>Boravak u društvu</SectionTitle>

        <Controller control={control} name="startedOn" render={({ field }) => (
          <DatePickerField
            label="Početak boravka *"
            value={field.value}
            onChange={field.onChange}
            minimumDate={emergedOn || undefined}
            maximumDate={today}
            required
            error={errors.startedOn?.message}
          />
        )} />
        <Controller control={control} name="introductionMethod" render={({ field }) => (
          <ChoiceGroup
            label="Način uvođenja *"
            value={field.value}
            onChange={field.onChange}
            error={errors.introductionMethod?.message}
            options={[
              { value: 'placement', label: 'Dodavanjem' },
              { value: 'caged', label: 'U kavezu' },
              { value: 'direct', label: 'Direktno' },
              { value: 'unknown', label: 'Nepoznato' },
              { value: 'other', label: 'Drugo' },
            ] as { value: QueenIntroductionMethod; label: string }[]}
          />
        )} />
        <Controller control={control} name="introductionOutcome" render={({ field }) => (
          <ChoiceGroup
            label="Ishod uvođenja"
            value={field.value}
            onChange={(value) => field.onChange(field.value === value ? null : value)}
            error={errors.introductionOutcome?.message}
            options={[
              { value: 'accepted', label: 'Prihvaćena' },
              { value: 'killed', label: 'Ubijena' },
              { value: 'missing', label: 'Nestala' },
              { value: 'unverified', label: 'Nije provereno' },
              { value: 'other', label: 'Drugo' },
            ] as { value: QueenIntroductionOutcome; label: string }[]}
          />
        )} />
        <Controller control={control} name="stayNotes" render={({ field }) => (
          <FormInput label="Napomena o boravku" value={field.value} onChangeText={field.onChange} error={errors.stayNotes?.message} multiline />
        )} />

        {mutation.isError && (
          <Text className="mb-4 text-sm text-error">
            {mutation.error instanceof Error
              ? mutation.error.message
              : 'Maticu nije moguće sačuvati. Pokušajte ponovo.'}
          </Text>
        )}

        <Pressable
          disabled={mutation.isPending}
          onPress={handleSubmit(onSubmit)}
          className={`min-h-14 items-center justify-center rounded-2xl bg-primary px-5 ${
            mutation.isPending ? 'opacity-60' : ''
          }`}
        >
          <Text className="text-base font-bold text-background">
            {mutation.isPending ? 'Čuvanje...' : 'Dodaj maticu'}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text className="mb-4 mt-8 text-lg font-bold text-foreground">{children}</Text>;
}

function ChoiceGroup<T extends string>({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: T | null;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  error?: string;
}) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={`mb-2 flex-row items-center rounded-2xl border px-4 py-3 ${
              selected ? 'border-primary bg-primary/10' : 'border-border bg-surface'
            }`}
          >
            <View className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
              selected ? 'border-primary' : 'border-muted'
            }`}>
              {selected && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
            </View>
            <Text className="ml-3 flex-1 text-base text-foreground">{option.label}</Text>
          </Pressable>
        );
      })}
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
}

function FormInput({
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
        className={`rounded-2xl border bg-surface px-4 text-base text-foreground ${
          multiline ? 'min-h-28 py-4' : 'h-14'
        } ${error ? 'border-error' : 'border-border'}`}
      />
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
}
