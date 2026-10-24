import { zodResolver } from '@hookform/resolvers/zod';

import { router } from 'expo-router';

import { Controller, useForm, useWatch } from 'react-hook-form';

import { Pressable, Text, TextInput, View } from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { useCreateColonyWithQueen } from '../hooks/use-create-colony-with-queen';

import {
  createColonyWithQueenSchema,
  type CreateColonyWithQueenFormValues,
} from '../schemas/create-colony-with-queen-schema';

import type { CreateColonyWithQueenRequest } from '../types/create-colony-with-queen';

import { colors } from '@/shared/theme/colors';
import { DatePickerField } from '@/shared/components/date-picker-field';
import { getCurrentUtcDateOnly } from '@/shared/utils/date-only';
import { QueenMarkingColorPicker } from '@/features/queens/components/queen-marking-color-picker';

type Props = {
  hiveId: string;
};

function optionalText(value: string): string | null {
  const normalized = value.trim();

  return normalized ? normalized : null;
}

function earliestDate(...dates: (string | undefined)[]) {
  return dates.filter((date): date is string => Boolean(date)).sort()[0];
}

function latestDate(...dates: (string | undefined)[]) {
  return dates
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);
}

export function CreateColonyWithQueenScreen({ hiveId }: Props) {
  const mutation = useCreateColonyWithQueen(hiveId);

  const today = getCurrentUtcDateOnly();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateColonyWithQueenFormValues>({
    resolver: zodResolver(createColonyWithQueenSchema),

    defaultValues: {
      colonyOrigin: null,

      colonyFormedOn: '',

      colonyStartedOn: today,

      colonyNotes: '',

      colonyStayNotes: '',

      queenMarkingColorHex: '',

      queenOrigin: null,

      queenBreeder: '',

      queenBreed: '',

      queenEmergedOn: '',

      queenAcquiredOn: '',

      queenNotes: '',

      queenStartedOn: today,

      queenIntroductionMethod: null,

      queenIntroductionOutcome: null,

      queenStayNotes: '',
    },
  });

  const colonyFormedOn = useWatch({
    control,
    name: 'colonyFormedOn',
  });

  const colonyStartedOn = useWatch({
    control,
    name: 'colonyStartedOn',
  });

  const queenEmergedOn = useWatch({
    control,
    name: 'queenEmergedOn',
  });

  const queenAcquiredOn = useWatch({
    control,
    name: 'queenAcquiredOn',
  });

  const queenStartedOn = useWatch({
    control,
    name: 'queenStartedOn',
  });

  const onSubmit = async (values: CreateColonyWithQueenFormValues) => {
    const request: CreateColonyWithQueenRequest = {
      colonyOrigin: values.colonyOrigin,

      colonyFormedOn: optionalText(values.colonyFormedOn),

      colonyStartedOn: values.colonyStartedOn,

      colonyNotes: optionalText(values.colonyNotes),

      colonyStayNotes: optionalText(values.colonyStayNotes),

      queenMarkingColorHex: optionalText(values.queenMarkingColorHex)?.toUpperCase() ?? null,

      queenOrigin: values.queenOrigin,

      queenBreeder: optionalText(values.queenBreeder),

      queenBreed: optionalText(values.queenBreed),

      queenEmergedOn: optionalText(values.queenEmergedOn),

      queenAcquiredOn: optionalText(values.queenAcquiredOn),

      queenNotes: optionalText(values.queenNotes),

      queenStartedOn: values.queenStartedOn,

      queenIntroductionMethod: values.queenIntroductionMethod,

      queenIntroductionOutcome: values.queenIntroductionOutcome,

      queenStayNotes: optionalText(values.queenStayNotes),
    };

    try {
      await mutation.mutateAsync(request);

      router.replace({
        pathname: '/hives/[hiveId]',

        params: {
          hiveId,
        },
      });
    } catch {
      // mutation error below
    }
  };

  return (
    <View
      className="
        flex-1
        bg-background
      "
    >
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
          className="
            mb-5
            self-start
            py-2
          "
        >
          <Text
            className="
              text-base
              font-semibold
              text-primary
            "
          >
            ← Nazad
          </Text>
        </Pressable>

        <Text
          className="
            text-2xl
            font-bold
            text-foreground
          "
        >
          Novo društvo i matica
        </Text>

        <Text
          className="
            mt-1
            text-sm
            text-muted
          "
        >
          Društvo i matica biće evidentirani zajedno u ovoj košnici.
        </Text>

        <SectionTitle>Pčelinje društvo</SectionTitle>

        <Controller
          control={control}
          name="colonyOrigin"
          render={({ field }) => (
            <ChoiceGroup
              label="Poreklo"
              value={field.value}
              onChange={field.onChange}
              options={[
                {
                  value: 'swarm',
                  label: 'Roj',
                },
                {
                  value: 'purchased',
                  label: 'Kupljeno',
                },
                {
                  value: 'split',
                  label: 'Podelom',
                },
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="colonyFormedOn"
          render={({ field }) => (
            <DatePickerField
              label="Datum formiranja"
              value={field.value}
              onChange={field.onChange}
              maximumDate={earliestDate(colonyStartedOn || undefined, today)}
              minimumDate={queenAcquiredOn || undefined}
              error={errors.colonyFormedOn?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="colonyStartedOn"
          render={({ field }) => (
            <DatePickerField
              label="U košnici od *"
              value={field.value}
              onChange={field.onChange}
              minimumDate={colonyFormedOn || undefined}
              maximumDate={today}
              required
              error={errors.colonyStartedOn?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="colonyNotes"
          render={({ field }) => (
            <FormInput
              label="Napomena o društvu"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />

        <SectionTitle>Matica</SectionTitle>

        <Controller
          control={control}
          name="queenOrigin"
          render={({ field }) => (
            <ChoiceGroup
              label="Poreklo"
              value={field.value}
              onChange={field.onChange}
              options={[
                {
                  value: 'purchased',
                  label: 'Kupljena',
                },
                {
                  value: 'produced',
                  label: 'Odgojena',
                },
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="queenBreed"
          render={({ field }) => (
            <FormInput label="Rasa" value={field.value} onChangeText={field.onChange} />
          )}
        />

        <Controller
          control={control}
          name="queenBreeder"
          render={({ field }) => (
            <FormInput label="Odgaјivač" value={field.value} onChangeText={field.onChange} />
          )}
        />

        <Controller
          control={control}
          name="queenMarkingColorHex"
          render={({ field }) => (
            <QueenMarkingColorPicker
              value={field.value}
              onChange={field.onChange}
              error={errors.queenMarkingColorHex?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="queenEmergedOn"
          render={({ field }) => (
            <DatePickerField
              label="Datum izleganja"
              value={field.value}
              onChange={field.onChange}
              maximumDate={earliestDate(
                queenAcquiredOn || undefined,
                queenStartedOn || undefined,
                today,
              )}
              error={errors.queenEmergedOn?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="queenAcquiredOn"
          render={({ field }) => (
            <DatePickerField
              label="Datum nabavke"
              value={field.value}
              onChange={field.onChange}
              minimumDate={queenEmergedOn || undefined}
              maximumDate={earliestDate(today)}
              error={errors.queenAcquiredOn?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="queenStartedOn"
          render={({ field }) => (
            <DatePickerField
              label="U društvu od *"
              value={field.value}
              onChange={field.onChange}
              minimumDate={latestDate(queenEmergedOn || undefined)}
              maximumDate={today}
              required
              error={errors.queenStartedOn?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="queenIntroductionMethod"
          render={({ field }) => (
            <ChoiceGroup
              label="Način uvođenja"
              value={field.value}
              onChange={field.onChange}
              options={[
                {
                  value: 'placement',
                  label: 'Postavljanje',
                },
                {
                  value: 'caged',
                  label: 'Kavez',
                },
                {
                  value: 'direct',
                  label: 'Direktno',
                },
                {
                  value: 'unknown',
                  label: 'Nepoznato',
                },
                {
                  value: 'other',
                  label: 'Ostalo',
                },
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="queenIntroductionOutcome"
          render={({ field }) => (
            <ChoiceGroup
              label="Ishod uvođenja"
              value={field.value}
              onChange={field.onChange}
              options={[
                {
                  value: 'accepted',
                  label: 'Prihvaćena',
                },
                {
                  value: 'killed',
                  label: 'Ubijena',
                },
                {
                  value: 'missing',
                  label: 'Nestala',
                },
                {
                  value: 'unverified',
                  label: 'Nepotvrđeno',
                },
                {
                  value: 'other',
                  label: 'Ostalo',
                },
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="queenNotes"
          render={({ field }) => (
            <FormInput
              label="Napomena o matici"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />

        {mutation.isError && (
          <Text
            className="
              mb-4
              text-sm
              text-error
            "
          >
            {mutation.error instanceof Error
              ? mutation.error.message
              : 'Podatke nije moguće sačuvati.'}
          </Text>
        )}

        <Pressable
          disabled={mutation.isPending}
          onPress={handleSubmit(onSubmit)}
          className={`
            min-h-14
            items-center
            justify-center
            rounded-2xl
            bg-primary
            px-5
            ${mutation.isPending ? 'opacity-60' : ''}
          `}
        >
          <Text
            className="
              text-base
              font-bold
              text-background
            "
          >
            {mutation.isPending ? 'Čuvanje...' : 'Sačuvaj društvo i maticu'}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}
type SectionTitleProps = {
  children: React.ReactNode;
};

function SectionTitle({ children }: SectionTitleProps) {
  return (
    <Text
      className="
        mb-3
        mt-8
        text-lg
        font-bold
        text-foreground
      "
    >
      {children}
    </Text>
  );
}
type FormInputProps = {
  label: string;

  value: string;

  onChangeText: (value: string) => void;

  placeholder?: string;

  error?: string;

  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';

  multiline?: boolean;
};

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  autoCapitalize = 'sentences',
  multiline = false,
}: FormInputProps) {
  return (
    <View className="mb-4">
      <Text
        className="
          mb-2
          text-sm
          font-semibold
          text-foreground
        "
      >
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={`
          rounded-2xl
          border
          bg-surface
          px-4
          text-base
          text-foreground
          ${multiline ? 'min-h-28 py-4' : 'h-14'}
          ${error ? 'border-error' : 'border-border'}
        `}
      />

      {error && (
        <Text
          className="
            mt-1
            text-sm
            text-error
          "
        >
          {error}
        </Text>
      )}
    </View>
  );
}
type ChoiceOption<T extends string> = {
  value: T;
  label: string;
};

type ChoiceGroupProps<T extends string> = {
  label: string;

  value: T | null;

  onChange: (value: T | null) => void;

  options: readonly ChoiceOption<T>[];

  error?: string;
};

function ChoiceGroup<T extends string>({
  label,
  value,
  onChange,
  options,
  error,
}: ChoiceGroupProps<T>) {
  return (
    <View
      className="
        mb-6
      "
    >
      <Text
        className="
          mb-3
          text-sm
          font-semibold
          text-foreground
        "
      >
        {label}
      </Text>

      <View
        className="
          flex-row
          flex-wrap
          justify-between
        "
        style={{
          rowGap: 8,
        }}
      >
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(selected ? null : option.value);
              }}
              style={{
                width: '32%',
                minHeight: 52,
              }}
              className={`
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  px-2
                  py-3
                  ${selected ? 'border-primary bg-primary' : 'border-border bg-surface'}
                `}
            >
              <Text
                numberOfLines={2}
                className={`
                    text-center
                    text-sm
                    font-semibold
                    ${selected ? 'text-background' : 'text-foreground'}
                  `}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error && (
        <Text
          className="
            mt-2
            text-sm
            text-error
          "
        >
          {error}
        </Text>
      )}
    </View>
  );
}
