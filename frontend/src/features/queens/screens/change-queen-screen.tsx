import {
  zodResolver,
} from '@hookform/resolvers/zod';
import Ionicons from '@react-native-vector-icons/ionicons';
import {
  router,
} from 'expo-router';
import {
  useState,
} from 'react';
import {
  Controller,
  useForm,
} from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
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
} from '@/features/queens/components/queen-marking-color-picker';
import {
  QueenMarkingColorSwatch,
} from '@/features/queens/components/queen-marking-color-swatch';
import {
  useAppDrawer,
} from '@/providers/app-drawer-provider';
import {
  DatePickerField,
} from '@/shared/components/date-picker-field';
import {
  AppHeader,
} from '@/shared/components/navigation/app-header';
import {
  ContextualActionBar,
} from '@/shared/components/contextual-action-bar/contextual-action-bar';
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
  useAvailableQueens,
} from '../hooks/use-available-queens';
import {
  useChangeQueen,
} from '../hooks/use-change-queen';
import {
  changeQueenSchema,
  type ChangeQueenFormValues,
} from '../schemas/change-queen-schema';
import type {
  ChangeQueenRequest,
} from '../types/change-queen';

type ChangeQueenScreenProps = {
  hiveId: string;
  colonyId: string;
  queenId: string;
};

type Step = 1 | 2 | 3;

const steps = ['Stara matica', 'Nova matica', 'Uvođenje'] as const;

function optionalText(value: string) {
  const normalized = value.trim();
  return normalized || null;
}

export function ChangeQueenScreen({
  hiveId,
  colonyId,
  queenId,
}: ChangeQueenScreenProps) {
  const { openDrawer } = useAppDrawer();
  const [step, setStep] = useState<Step>(1);
  const mutation = useChangeQueen(colonyId);
  const availableQueensQuery = useAvailableQueens();
  const today = getCurrentUtcDateOnly();
  const {
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChangeQueenFormValues>({
    resolver: zodResolver(changeQueenSchema),
    defaultValues: {
      changedOn: today,
      currentQueenEndReason: 'replaced',
      currentQueenStatus: 'active',
      source: 'new',
      existingQueenId: '',
      markingColorHex: '',
      origin: null,
      breeder: '',
      breed: '',
      emergedOn: '',
      acquiredOn: '',
      notes: '',
      introductionMethod: null,
      newQueenStayNotes: '',
    },
  });
  const source = watch('source');

  const onSubmit = async (values: ChangeQueenFormValues) => {
    const request: ChangeQueenRequest = {
      changedOn: values.changedOn,
      currentQueenEndReason: values.currentQueenEndReason,
      currentQueenStatus: values.currentQueenStatus,
      existingQueenId: source === 'existing' ? values.existingQueenId : null,
      newQueen: source === 'new' ? {
        markingColorHex: optionalText(values.markingColorHex)?.toUpperCase() ?? null,
        origin: values.origin,
        breeder: optionalText(values.breeder),
        breed: optionalText(values.breed),
        emergedOn: optionalText(values.emergedOn),
        acquiredOn: optionalText(values.acquiredOn),
        notes: optionalText(values.notes),
      } : null,
      introductionMethod: values.introductionMethod,
      newQueenStayNotes: optionalText(values.newQueenStayNotes),
    };

    try {
      const response = await mutation.mutateAsync(request);
      router.replace({
        pathname: '/hives/[hiveId]/colonies/[colonyId]/queens/[queenId]',
        params: { hiveId, colonyId, queenId: response.queenId },
      } as never);
    } catch {
      // The recoverable API error is rendered below without clearing the form.
    }
  };

  const moveNext = async () => {
    const fields = step === 1
      ? ['changedOn', 'currentQueenEndReason', 'currentQueenStatus'] as const
      : step === 2 && source === 'existing'
        ? ['source', 'existingQueenId'] as const
        : ['source', 'markingColorHex', 'origin', 'breeder', 'breed', 'emergedOn', 'acquiredOn', 'notes'] as const;

    if (await trigger(fields)) {
      setStep((step + 1) as Step);
    }
  };

  const movePrevious = () => {
    setStep((step - 1) as Step);
  };

  const confirmCancellation = () => {
    Alert.alert(
      'Otkaži promenu matice?',
      'Uneti podaci neće biti sačuvani.',
      [
        { text: 'Nastavi unos', style: 'cancel' },
        {
          text: 'Otkaži promenu',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ],
    );
  };

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
              accessibilityLabel: 'Otkaži promenu matice',
              onPress: confirmCancellation,
              disabled: mutation.isPending,
            },
          ]}
          primaryAction={{
            key: 'confirm',
            label: 'Potvrdi',
            icon: 'checkmark',
            accessibilityLabel: 'Potvrdi promenu matice',
            onPress: () => {
              void handleSubmit(onSubmit)();
            },
            hidden: step !== 3,
            disabled: mutation.isPending,
            loading: mutation.isPending,
          }}
          rightActions={[
            {
              key: 'previous',
              label: 'Nazad',
              icon: 'arrow-back-outline',
              accessibilityLabel: 'Prethodni korak',
              onPress: movePrevious,
              disabled: step === 1 || mutation.isPending,
            },
            {
              key: 'next',
              label: 'Dalje',
              icon: 'arrow-forward-outline',
              accessibilityLabel: 'Sledeći korak',
              onPress: () => {
                void moveNext();
              },
              hidden: step === 3,
              disabled: mutation.isPending,
            },
          ]}
        />
      }
    >
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        <Pressable onPress={() => router.back()} className="self-start py-2">
          <Text className="text-sm font-semibold text-primary">← Matica</Text>
        </Pressable>

        <Text className="mt-3 text-2xl font-bold text-foreground">Promena matice</Text>
        <Text className="mt-1 text-sm text-muted">
          Zatvarate trenutni boravak i evidentirate novu maticu u društvu.
        </Text>
        <StepLegend step={step} />

        {step === 1 && (
          <>
            <SectionTitle>Završetak boravka stare matice</SectionTitle>
            <Controller control={control} name="changedOn" render={({ field }) => (
              <DatePickerField label="Datum promene *" value={field.value} onChange={field.onChange} maximumDate={today} required error={errors.changedOn?.message} />
            )} />
            <Controller control={control} name="currentQueenEndReason" render={({ field }) => (
              <ChoiceGroup label="Zašto matica prestaje da pripada društvu?" value={field.value} onChange={(value) => {
                field.onChange(value);
                if (value === 'dead') setValue('currentQueenStatus', 'dead');
                if (value === 'missing') setValue('currentQueenStatus', 'missing');
              }} options={[
                { value: 'replaced', label: 'Zamena matice' },
                { value: 'dead', label: 'Matica uginula' },
                { value: 'missing', label: 'Matica izgubljena' },
                { value: 'colonyWithoutQueen', label: 'Društvo bez matice' },
                { value: 'removed', label: 'Prodata / uklonjena' },
                { value: 'other', label: 'Drugo' },
              ]} />
            )} />
            <Controller control={control} name="currentQueenStatus" render={({ field }) => (
              <ChoiceGroup label="Šta se desilo sa starom maticom?" value={field.value} onChange={field.onChange} options={[
                { value: 'active', label: 'Ostaje aktivna i dostupna' },
                { value: 'dead', label: 'Uginula' },
                { value: 'missing', label: 'Nestala' },
                { value: 'sold', label: 'Prodata' },
                { value: 'removed', label: 'Uklonjena' },
              ]} />
            )} />
          </>
        )}

        {step === 2 && (
          <>
            <SectionTitle>Nova matica</SectionTitle>
            <Controller control={control} name="source" render={({ field }) => (
              <ChoiceGroup label="Način izbora" value={field.value} onChange={(value) => {
                field.onChange(value);
                setValue('existingQueenId', '');
              }} options={[
                { value: 'new', label: 'Evidentiraj novu maticu' },
                { value: 'existing', label: 'Izaberi postojeću maticu' },
              ]} />
            )} />
            {source === 'existing' ? (
              <AvailableQueenPicker control={control} error={errors.existingQueenId?.message} queens={availableQueensQuery.data ?? []} isLoading={availableQueensQuery.isLoading} />
            ) : (
              <NewQueenFields control={control} errors={errors} changedOn={watch('changedOn')} today={today} />
            )}
          </>
        )}

        {step === 3 && (
          <>
            <SectionTitle>Uvođenje nove matice</SectionTitle>
            <Controller control={control} name="introductionMethod" render={({ field }) => (
              <ChoiceGroup label="Način uvođenja *" value={field.value} onChange={field.onChange} error={errors.introductionMethod?.message} options={[
                { value: 'placement', label: 'Postavljanje' }, { value: 'caged', label: 'Kavez' }, { value: 'direct', label: 'Direktno' }, { value: 'unknown', label: 'Nepoznato' }, { value: 'other', label: 'Ostalo' },
              ]} />
            )} />
            <Controller control={control} name="newQueenStayNotes" render={({ field }) => (
              <FormInput label="Napomena o novom boravku" value={field.value} onChangeText={field.onChange} multiline error={errors.newQueenStayNotes?.message} />
            )} />
          </>
        )}

        {mutation.isError && <Text className="mt-5 text-sm text-error">{mutation.error instanceof Error ? mutation.error.message : 'Promenu nije moguće sačuvati.'}</Text>}
      </KeyboardAwareScrollView>
    </Screen>
  );
}

function StepLegend({ step }: { step: Step }) {
  return (
    <View className="mb-4 mt-7 flex-row items-start">
      {steps.map((label, index) => {
        const stepNumber = (index + 1) as Step;
        const isCurrent = stepNumber === step;
        const isComplete = stepNumber < step;

        return (
          <View key={label} className="relative flex-1 items-center">
            {index > 0 && (
              <View
                className={`absolute left-0 right-1/2 top-5 h-0.5 ${step > stepNumber - 1 ? 'bg-primary' : 'bg-border'}`}
              />
            )}
            {index < steps.length - 1 && (
              <View
                className={`absolute left-1/2 right-0 top-5 h-0.5 ${step > stepNumber ? 'bg-primary' : 'bg-border'}`}
              />
            )}
            <View className="relative z-10 h-10 w-10 items-center justify-center rounded-full bg-background">
              <View className={`h-8 w-8 items-center justify-center rounded-full ${isCurrent || isComplete ? 'bg-primary' : 'bg-border'}`}>
                <Text className={`text-xs font-bold ${isCurrent || isComplete ? 'text-background' : 'text-muted'}`}>
                  {isComplete ? '✓' : stepNumber}
                </Text>
              </View>
            </View>
            <Text numberOfLines={1} className={`mt-2 text-center text-[11px] font-semibold ${isCurrent ? 'text-primary' : 'text-muted'}`}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) { return <Text className="mb-4 mt-5 text-lg font-bold text-foreground">{children}</Text>; }

type ChoiceOption = { value: string; label: string };
function ChoiceGroup({ label, value, onChange, options, error }: { label: string; value: string | null; onChange: (value: never) => void; options: ChoiceOption[]; error?: string }) {
  return <View className="mb-5"><Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text>{options.map((option) => <Pressable key={option.value} onPress={() => onChange(option.value as never)} className={`mb-2 flex-row items-center rounded-2xl border px-4 py-3 ${value === option.value ? 'border-primary bg-primary/10' : 'border-border bg-surface'}`}><View className={`h-5 w-5 items-center justify-center rounded-full border-2 ${value === option.value ? 'border-primary' : 'border-muted'}`}>{value === option.value && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}</View><Text className="ml-3 flex-1 text-base text-foreground">{option.label}</Text></Pressable>)}{error && <Text className="mt-1 text-sm text-error">{error}</Text>}</View>;
}

function AvailableQueenPicker({ control, error, queens, isLoading }: { control: ReturnType<typeof useForm<ChangeQueenFormValues>>['control']; error?: string; queens: import('../types/change-queen').AvailableQueen[]; isLoading: boolean }) {
  if (isLoading) return <ActivityIndicator className="my-6" color={colors.primary} />;
  return <Controller control={control} name="existingQueenId" render={({ field }) => <View>{queens.length === 0 ? <Text className="rounded-2xl border border-border bg-surface p-4 text-muted">Nema dostupnih matica u evidenciji.</Text> : queens.map((queen) => <Pressable key={queen.id} onPress={() => field.onChange(queen.id)} className={`mb-2 rounded-2xl border p-4 ${field.value === queen.id ? 'border-primary bg-primary/10' : 'border-border bg-surface'}`}><View className="flex-row items-center"><QueenMarkingColorSwatch colorHex={queen.markingColorHex} /><View className="ml-3 flex-1"><Text className="font-bold text-foreground">Matica</Text><Text className="mt-1 text-sm text-muted">{queen.breed ?? queen.breeder ?? 'Bez dodatnih podataka'}</Text></View><Ionicons name={field.value === queen.id ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={field.value === queen.id ? colors.primary : colors.muted} /></View></Pressable>)}{error && <Text className="mt-1 text-sm text-error">{error}</Text>}</View>} />;
}

function NewQueenFields({ control, errors, changedOn, today }: { control: ReturnType<typeof useForm<ChangeQueenFormValues>>['control']; errors: ReturnType<typeof useForm<ChangeQueenFormValues>>['formState']['errors']; changedOn: string; today: string }) {
  return <><Controller control={control} name="origin" render={({ field }) => <ChoiceGroup label="Poreklo *" value={field.value} onChange={field.onChange} error={errors.origin?.message} options={[{ value: 'purchased', label: 'Kupljena' }, { value: 'produced', label: 'Odgojena' }]} />} /><Controller control={control} name="breed" render={({ field }) => <FormInput label="Rasa" value={field.value} onChangeText={field.onChange} error={errors.breed?.message} />} /><Controller control={control} name="breeder" render={({ field }) => <FormInput label="Odgajivač" value={field.value} onChangeText={field.onChange} error={errors.breeder?.message} />} /><Controller control={control} name="markingColorHex" render={({ field }) => <QueenMarkingColorPicker value={field.value} onChange={field.onChange} error={errors.markingColorHex?.message} />} /><Controller control={control} name="emergedOn" render={({ field }) => <DatePickerField label="Datum izleganja" value={field.value} onChange={field.onChange} maximumDate={changedOn || today} error={errors.emergedOn?.message} />} /><Controller control={control} name="acquiredOn" render={({ field }) => <DatePickerField label="Datum nabavke" value={field.value} onChange={field.onChange} maximumDate={today} error={errors.acquiredOn?.message} />} /><Controller control={control} name="notes" render={({ field }) => <FormInput label="Napomena o matici" value={field.value} onChangeText={field.onChange} multiline error={errors.notes?.message} />} /></>;
}

function FormInput({ label, value, onChangeText, error, multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; error?: string; multiline?: boolean }) { return <View className="mb-4"><Text className="mb-2 text-sm font-semibold text-foreground">{label}</Text><TextInput value={value} onChangeText={onChangeText} multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} placeholderTextColor={colors.muted} className={`rounded-2xl border bg-surface px-4 text-base text-foreground ${multiline ? 'min-h-28 py-4' : 'h-14'} ${error ? 'border-error' : 'border-border'}`} />{error && <Text className="mt-1 text-sm text-error">{error}</Text>}</View>; }
