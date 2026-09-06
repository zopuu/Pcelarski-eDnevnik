import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  router,
} from 'expo-router';

import {
  Controller,
  useForm,
} from 'react-hook-form';

import {
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

import {
  useCurrentQueen,
} from '../hooks/use-current-queen';
import {
  useEndQueenStay,
} from '../hooks/use-end-queen-stay';
import {
  endQueenStaySchema,
} from '../schemas/end-queen-stay-schema';
import type {
  EndQueenStayFormValues,
} from '../schemas/end-queen-stay-schema';
import type {
  QueenStatus,
} from '../types/queen';

import {
  DatePickerField,
} from '@/shared/components/date-picker-field';
import {
  ContextualActionBar,
} from '@/shared/components/contextual-action-bar/contextual-action-bar';
import {
  AppHeader,
} from '@/shared/components/navigation/app-header';
import {
  Screen,
} from '@/shared/components/screen/screen';
import {
  colors,
} from '@/shared/theme/colors';
import {
  getCurrentUtcDateOnly,
} from '@/shared/utils/date-only';
import {
  useAppDrawer,
} from '@/providers/app-drawer-provider';

type EndQueenStayScreenProps = {
  hiveId: string;
  colonyId: string;
  queenId: string;
};

type EndQueenStayReason =
  | 'dead'
  | 'killed'
  | 'sold'
  | 'removed'
  | 'swarmed'
  | 'colonyWithoutQueen'
  | 'other';

const endReasonOptions: {
  value: EndQueenStayReason;
  label: string;
}[] = [
  { value: 'dead', label: 'Matica uginula' },
  { value: 'killed', label: 'Matica ubijena' },
  { value: 'sold', label: 'Matica prodata' },
  { value: 'removed', label: 'Matica uklonjena' },
  { value: 'swarmed', label: 'Matica se izrojila' },
  { value: 'colonyWithoutQueen', label: 'Društvo bez matice' },
  { value: 'other', label: 'Drugo' },
];

const queenStatusOptions: {
  value: QueenStatus;
  label: string;
}[] = [
  { value: 'active', label: 'Ostaje aktivna i dostupna' },
  { value: 'dead', label: 'Uginula' },
  { value: 'killed', label: 'Ubijena' },
  { value: 'sold', label: 'Prodata' },
  { value: 'removed', label: 'Uklonjena' },
];

export function EndQueenStayScreen({
  hiveId,
  colonyId,
  queenId,
}: EndQueenStayScreenProps) {
  const { openDrawer } = useAppDrawer();
  const queenQuery = useCurrentQueen(colonyId);
  const mutation = useEndQueenStay(colonyId);
  const today = getCurrentUtcDateOnly();
  const queen = queenQuery.data?.id === queenId
    ? queenQuery.data
    : null;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {
      errors,
    },
  } = useForm<EndQueenStayFormValues>({
    resolver: zodResolver(endQueenStaySchema),
    defaultValues: {
      endedOn: today,
      endReason: 'other',
      queenStatus: 'active',
    },
  });
  const endReason = watch('endReason');

  const confirmCancellation = () => {
    Alert.alert(
      'Otkaži završavanje boravka?',
      'Uneti podaci neće biti sačuvani.',
      [
        { text: 'Nastavi unos', style: 'cancel' },
        {
          text: 'Otkaži unos',
          style: 'destructive',
          onPress: () => {
            router.back();
          },
        },
      ],
    );
  };

  const onSubmit = async (values: EndQueenStayFormValues) => {
    try {
      await mutation.mutateAsync({
        endedOn: values.endedOn,
        endReason: values.endReason === 'sold'
          ? 'removed'
          : values.endReason,
        queenStatus: values.queenStatus,
      });

      router.replace({
        pathname: '/hives/[hiveId]/colonies/[colonyId]',
        params: {
          hiveId,
          colonyId,
        },
      } as never);
    } catch {
      // The recoverable API error is rendered below without clearing the form.
    }
  };

  if (queenQuery.isLoading) {
    return <LoadingState label="Učitavanje matice..." />;
  }

  if (queenQuery.isError || !queen) {
    return <LoadError />;
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
              accessibilityLabel: 'Otkaži završavanje boravka matice',
              onPress: confirmCancellation,
              disabled: mutation.isPending,
            },
          ]}
          primaryAction={{
            key: 'confirm',
            label: 'Završi',
            icon: 'checkmark',
            accessibilityLabel: 'Potvrdi završavanje boravka matice',
            onPress: () => {
              void handleSubmit(onSubmit)();
            },
            disabled: mutation.isPending,
            loading: mutation.isPending,
          }}
          rightActions={[]}
        />
      }
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
          className="self-start py-2"
        >
          <Text className="text-sm font-semibold text-primary">
            ← Matica
          </Text>
        </Pressable>

        <Text className="mt-3 text-2xl font-bold text-foreground">
          Završi boravak matice
        </Text>

        <Text className="mt-1 text-sm text-muted">
          Boravak se zatvara bez evidentiranja nove matice u društvu.
        </Text>

        <StayFlow />

        <Text className="mb-4 mt-5 text-lg font-bold text-foreground">
          Završetak boravka
        </Text>

        <Controller
          control={control}
          name="endedOn"
          render={({ field }) => (
            <DatePickerField
              label="Datum završetka *"
              value={field.value}
              onChange={field.onChange}
              minimumDate={queen.startedOn}
              maximumDate={today}
              required
              error={errors.endedOn?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="endReason"
          render={({ field }) => (
            <ChoiceGroup
              label="Zašto matica prestaje da pripada društvu?"
              value={field.value}
              options={endReasonOptions}
              error={errors.endReason?.message}
              onChange={(value) => {
                field.onChange(value);

                if (value === 'dead') {
                  setValue('queenStatus', 'dead', {
                    shouldValidate: true,
                  });
                }

                if (value === 'killed') {
                  setValue('queenStatus', 'killed', {
                    shouldValidate: true,
                  });
                }

                if (value === 'sold') {
                  setValue('queenStatus', 'sold', {
                    shouldValidate: true,
                  });
                }

                if (value === 'removed') {
                  setValue('queenStatus', 'removed', {
                    shouldValidate: true,
                  });
                }

                if (value === 'swarmed') {
                  setValue('queenStatus', 'active', {
                    shouldValidate: true,
                  });
                }
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="queenStatus"
          render={({ field }) => (
            <ChoiceGroup
              label="Šta se desilo sa maticom?"
              value={field.value}
              options={queenStatusOptions}
              error={errors.queenStatus?.message}
              onChange={field.onChange}
              disabled={
                endReason === 'dead' ||
                endReason === 'killed' ||
                endReason === 'sold' ||
                endReason === 'removed' ||
                endReason === 'swarmed'
              }
            />
          )}
        />

        {mutation.isError && (
          <View className="mt-2 rounded-2xl border border-error/30 bg-surface px-4 py-3">
            <Text className="text-sm text-error">
              {mutation.error instanceof Error
                ? mutation.error.message
                : 'Boravak nije moguće završiti. Pokušajte ponovo.'}
            </Text>
          </View>
        )}
      </KeyboardAwareScrollView>
    </Screen>
  );
}

function StayFlow() {
  return (
    <View className="mb-4 mt-7 flex-row items-start">
      <FlowStep label="Trenutni boravak" active />
      <View className="mt-5 h-0.5 flex-1 bg-primary" />
      <FlowStep label="Završen boravak" />
    </View>
  );
}

function FlowStep({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <View className="w-24 items-center">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-background">
        <View className={`h-8 w-8 items-center justify-center rounded-full ${
          active ? 'bg-primary' : 'bg-border'
        }`}>
          <Text className={`text-xs font-bold ${
            active ? 'text-background' : 'text-muted'
          }`}>
            {active ? '1' : '2'}
          </Text>
        </View>
      </View>

      <Text className={`mt-2 text-center text-[11px] font-semibold ${
        active ? 'text-primary' : 'text-muted'
      }`}>
        {label}
      </Text>
    </View>
  );
}

function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
  disabled = false,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-foreground">
        {label}
      </Text>

      {options.map((option) => {
        const selected = value === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            disabled={disabled}
            onPress={() => {
              if (disabled) {
                return;
              }

              onChange(option.value);
            }}
            className={`mb-2 flex-row items-center rounded-2xl border px-4 py-3 ${
              selected
                ? 'border-primary bg-primary/10'
                : 'border-border bg-surface'
            } ${disabled ? 'opacity-50' : ''}`}
          >
            <View className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
              selected ? 'border-primary' : 'border-muted'
            }`}>
              {selected && (
                <View className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </View>

            <Text className="ml-3 flex-1 text-base text-foreground">
              {option.label}
            </Text>
          </Pressable>
        );
      })}

      {error && (
        <Text className="mt-1 text-sm text-error">{error}</Text>
      )}
    </View>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-muted">{label}</Text>
    </View>
  );
}

function LoadError() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <Text className="text-center text-base font-semibold text-error">
        Nije moguće učitati trenutnu maticu.
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
