import { zodResolver } from '@hookform/resolvers/zod';
import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiError } from '@/shared/api/api-error';
import { DatePickerField } from '@/shared/components/date-picker-field';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';
import { getCurrentUtcDateOnly } from '@/shared/utils/date-only';
import { HarvestGroupCard } from '../components/harvest-group-card';
import { HarvestErrorState, HarvestLoadingState } from '../components/harvest-screen-states';
import { useAvailableHarvestGroups } from '../hooks/use-available-harvest-groups';
import { useCreateHarvest } from '../hooks/use-create-harvest';
import {
  harvestDataSchema,
  type HarvestDataFormInput,
  type HarvestDataFormValues,
} from '../schemas/harvest-data-schema';
import type {
  AvailableHarvestGroup,
  CreateHarvestResponse,
} from '../types/harvest';
import { formatAmount, formatHarvestDate, formatPeriod } from '../utils/harvest-format';

type CreateStep = 'group' | 'frames' | 'data' | 'confirm' | 'success';

export function CreateHarvestScreen() {
  const groupsQuery = useAvailableHarvestGroups();
  const createMutation = useCreateHarvest();
  const [step, setStep] = useState<CreateStep>('group');
  const [selectedGroup, setSelectedGroup] = useState<AvailableHarvestGroup | null>(null);
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);
  const [frameText, setFrameText] = useState('');
  const [frameError, setFrameError] = useState<string | null>(null);
  const [selectedFrameCount, setSelectedFrameCount] = useState<number | null>(null);
  const [harvestData, setHarvestData] = useState<HarvestDataFormValues | null>(null);
  const [success, setSuccess] = useState<CreateHarvestResponse | null>(null);
  const [flowError, setFlowError] = useState<string | null>(null);

  const form = useForm<HarvestDataFormInput, unknown, HarvestDataFormValues>({
    resolver: zodResolver(harvestDataSchema),
    defaultValues: {
      harvestedOn: getCurrentUtcDateOnly(),
      honeyAmount: '',
      notes: '',
    },
  });

  const goBack = () => {
    setFlowError(null);
    if (step === 'group') return router.back();
    if (step === 'frames') return setStep('group');
    if (step === 'data') return setStep('frames');
    if (step === 'confirm') return setStep('data');
  };

  const continueFromFrames = () => {
    if (!selectedGroup) return setStep('group');
    if (!/^\d+$/.test(frameText.trim())) {
      setFrameError('Unesite ceo broj ramova.');
      return;
    }
    const count = Number(frameText);
    if (count < 1 || count > selectedGroup.totalRemainingFrameCount) {
      setFrameError(`Broj ramova mora biti između 1 i ${selectedGroup.totalRemainingFrameCount}.`);
      return;
    }
    setFrameError(null);
    setSelectedFrameCount(count);
    setStep('data');
  };

  const continueFromData = (values: HarvestDataFormValues) => {
    setHarvestData(values);
    setFlowError(null);
    setStep('confirm');
  };

  const confirmHarvest = async () => {
    if (!selectedGroup || selectedFrameCount === null || !harvestData) return;
    setFlowError(null);
    try {
      const response = await createMutation.mutateAsync({
        groupKey: selectedGroup.groupKey,
        selectedFrameCount,
        harvestedOn: harvestData.harvestedOn,
        honeyAmount: harvestData.honeyAmount,
        notes: harvestData.notes || null,
      });
      setSuccess(response);
      setStep('success');
    } catch (error) {
      if (isSourceGroupChanged(error)) {
        await groupsQuery.refetch();
        setSelectedGroup(null);
        setSelectedFrameCount(null);
        setFrameText('');
        setFlowError('Dostupni ramovi su se u međuvremenu promenili. Osvežite podatke i pokušajte ponovo.');
        setStep('group');
        return;
      }
      setFlowError(getCreateErrorMessage(error));
    }
  };

  if (step === 'success' && success) return <HarvestSuccess response={success} />;

  return (
    <Screen>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
        <View className="px-4 pt-3">
          <Pressable accessibilityRole="button" accessibilityLabel="Vrati se" onPress={goBack} className="min-h-11 self-start justify-center">
            <Text className="text-base font-semibold text-primary">← Nazad</Text>
          </Pressable>
          <Text className="mt-1 text-2xl font-bold tracking-tight text-foreground">Novo vrcanje</Text>
          <StepIndicator step={step} />
        </View>

        {step === 'group' && (
          <SelectGroupStep
            query={groupsQuery}
            selectedGroup={selectedGroup}
            expandedGroupKey={expandedGroupKey}
            onSelect={setSelectedGroup}
            onToggleExpanded={(key) => setExpandedGroupKey((current) => current === key ? null : key)}
            error={flowError}
            onContinue={() => {
              if (!selectedGroup) return;
              setFrameText(String(selectedGroup.totalRemainingFrameCount));
              setFrameError(null);
              setStep('frames');
            }}
          />
        )}
        {step === 'frames' && selectedGroup && (
          <FrameCountStep
            group={selectedGroup}
            value={frameText}
            error={frameError}
            onChange={(value) => { setFrameText(value.replace(/[^0-9]/g, '')); setFrameError(null); }}
            onAll={() => { setFrameText(String(selectedGroup.totalRemainingFrameCount)); setFrameError(null); }}
            onContinue={continueFromFrames}
          />
        )}
        {step === 'data' && (
          <HarvestDataStep form={form} onContinue={continueFromData} />
        )}
        {step === 'confirm' && selectedGroup && selectedFrameCount !== null && harvestData && (
          <ConfirmationStep
            group={selectedGroup}
            frameCount={selectedFrameCount}
            data={harvestData}
            error={flowError}
            isSaving={createMutation.isPending}
            onBack={() => setStep('data')}
            onConfirm={() => void confirmHarvest()}
          />
        )}
      </SafeAreaView>
    </Screen>
  );
}

function SelectGroupStep({ query, selectedGroup, expandedGroupKey, onSelect, onToggleExpanded, onContinue, error }: {
  query: ReturnType<typeof useAvailableHarvestGroups>;
  selectedGroup: AvailableHarvestGroup | null;
  expandedGroupKey: string | null;
  onSelect: (group: AvailableHarvestGroup) => void;
  onToggleExpanded: (key: string) => void;
  onContinue: () => void;
  error: string | null;
}) {
  if (query.isLoading) return <HarvestLoadingState label="Učitavanje dostupnih nastavaka..." />;
  if (query.isError || !query.data) return <HarvestErrorState message="Nije moguće učitati dostupne nastavke." onRetry={() => void query.refetch()} />;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40, flexGrow: 1 }}>
      <Text className="text-xl font-bold text-foreground">Izaberite grupu za vrcanje</Text>
      <Text className="mt-1 text-sm leading-5 text-muted">Možete izabrati jednu grupu nastavaka sa istim periodom i istorijom lokacija.</Text>
      {error && <ErrorBanner message={error} />}
      {query.data.groups.length === 0 ? (
        <View className="mt-8 flex-1 items-center justify-center rounded-3xl border border-border bg-surface px-6 py-10">
          <Ionicons name="albums-outline" size={38} color={colors.muted} />
          <Text className="mt-4 text-center text-xl font-bold text-foreground">Nema nastavaka spremnih za vrcanje</Text>
          <Text className="mt-2 text-center text-sm leading-5 text-muted">Kada nastavci budu imali raspoložive ramove, pojaviće se ovde.</Text>
        </View>
      ) : (
        <View className="mt-5 gap-4">
          {query.data.groups.map((group) => (
            <HarvestGroupCard
              key={group.groupKey}
              group={group}
              selected={selectedGroup?.groupKey === group.groupKey}
              expanded={expandedGroupKey === group.groupKey}
              onSelect={() => onSelect(group)}
              onToggleExpanded={() => onToggleExpanded(group.groupKey)}
            />
          ))}
          <PrimaryButton label="Nastavi" disabled={!selectedGroup} onPress={onContinue} />
        </View>
      )}
    </ScrollView>
  );
}

function FrameCountStep({ group, value, error, onChange, onAll, onContinue }: {
  group: AvailableHarvestGroup;
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onAll: () => void;
  onContinue: () => void;
}) {
  return (
    <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text className="text-xl font-bold text-foreground">Koliko ramova želite da vrcate?</Text>
      <View className="mt-5 rounded-3xl border border-border bg-surface px-5 py-5">
        <Text className="text-sm text-muted">Ukupno dostupno</Text>
        <Text className="mt-1 text-3xl font-bold text-primary">{group.totalRemainingFrameCount} ramova</Text>
        <Text className="mt-2 text-sm text-muted">{group.superCount} nastavaka · {formatPeriod(group.periodStartedOn, group.periodEndedOn)}</Text>
      </View>
      <View className="mt-6">
        <Text className="mb-2 text-sm font-semibold text-foreground">Broj ramova *</Text>
        <View className="flex-row gap-2">
          <TextInput
            accessibilityLabel="Broj ramova za vrcanje"
            value={value}
            onChangeText={onChange}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={colors.muted}
            className={`h-14 flex-1 rounded-2xl border bg-surface px-4 text-lg text-foreground ${error ? 'border-error' : 'border-border'}`}
          />
          <Pressable accessibilityRole="button" onPress={onAll} className="min-h-14 items-center justify-center rounded-2xl border border-primary bg-surface px-4">
            <Text className="font-bold text-primary">Vrcaj sve</Text>
          </Pressable>
        </View>
        {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
      </View>
      <PrimaryButton label="Nastavi" onPress={onContinue} className="mt-6" />
    </KeyboardAwareScrollView>
  );
}

function HarvestDataStep({ form, onContinue }: {
  form: ReturnType<typeof useForm<HarvestDataFormInput, unknown, HarvestDataFormValues>>;
  onContinue: (values: HarvestDataFormValues) => void;
}) {
  return (
    <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text className="text-xl font-bold text-foreground">Podaci o vrcanju</Text>
      <Text className="mt-1 text-sm text-muted">Unesite datum i ukupnu količinu dobijenog meda.</Text>
      <View className="mt-6">
        <Controller control={form.control} name="harvestedOn" render={({ field }) => (
          <DatePickerField label="Datum vrcanja *" value={field.value} onChange={field.onChange} required maximumDate={getCurrentUtcDateOnly()} error={form.formState.errors.harvestedOn?.message} />
        )} />
        <Controller control={form.control} name="honeyAmount" render={({ field }) => (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-foreground">Količina meda *</Text>
            <View className="flex-row">
              <TextInput
                accessibilityLabel="Količina meda u kilogramima"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="decimal-pad"
                placeholder="0,0"
                placeholderTextColor={colors.muted}
                className={`h-14 flex-1 rounded-l-2xl border border-r-0 bg-surface px-4 text-base text-foreground ${form.formState.errors.honeyAmount ? 'border-error' : 'border-border'}`}
              />
              <View className={`h-14 items-center justify-center rounded-r-2xl border bg-surface-warm px-5 ${form.formState.errors.honeyAmount ? 'border-error' : 'border-border'}`}>
                <Text className="font-bold text-foreground">kg</Text>
              </View>
            </View>
            {form.formState.errors.honeyAmount && <Text className="mt-1 text-sm text-error">{form.formState.errors.honeyAmount.message}</Text>}
          </View>
        )} />
        <Controller control={form.control} name="notes" render={({ field }) => (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-foreground">Napomena</Text>
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              multiline
              textAlignVertical="top"
              placeholder="Dodajte napomenu o vrcanju..."
              placeholderTextColor={colors.muted}
              className={`min-h-28 rounded-2xl border bg-surface px-4 py-3 text-base text-foreground ${form.formState.errors.notes ? 'border-error' : 'border-border'}`}
            />
            {form.formState.errors.notes && <Text className="mt-1 text-sm text-error">{form.formState.errors.notes.message}</Text>}
          </View>
        )} />
      </View>
      <PrimaryButton label="Pregled vrcanja" onPress={() => void form.handleSubmit(onContinue)()} />
    </KeyboardAwareScrollView>
  );
}

function ConfirmationStep({ group, frameCount, data, error, isSaving, onBack, onConfirm }: {
  group: AvailableHarvestGroup;
  frameCount: number;
  data: HarvestDataFormValues;
  error: string | null;
  isSaving: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text className="text-xl font-bold text-foreground">Potvrdite vrcanje</Text>
      <Text className="mt-1 text-sm text-muted">Proverite podatke pre čuvanja.</Text>
      <View className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface">
        <SummaryRow label="Period izvora" value={formatPeriod(group.periodStartedOn, group.periodEndedOn)} />
        <SummaryRow label="Broj ramova" value={String(frameCount)} />
        <SummaryRow label="Datum vrcanja" value={formatHarvestDate(data.harvestedOn)} />
        <SummaryRow label="Količina meda" value={formatAmount(data.honeyAmount, 'kg')} />
        <SummaryRow label="Napomena" value={data.notes || 'Nema napomene'} />
      </View>
      {error && <ErrorBanner message={error} />}
      <View className="mt-6 flex-row gap-3">
        <SecondaryButton label="Nazad" disabled={isSaving} onPress={onBack} />
        <PrimaryButton label={isSaving ? 'Čuvanje...' : 'Potvrdi vrcanje'} disabled={isSaving} onPress={onConfirm} className="flex-1" />
      </View>
    </ScrollView>
  );
}

function HarvestSuccess({ response }: { response: CreateHarvestResponse }) {
  return (
    <Screen>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 40 }}>
          <View className="items-center rounded-3xl border border-border bg-surface px-6 py-8">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <Ionicons name="checkmark" size={44} color={colors.success} />
          </View>
          <Text className="mt-5 text-center text-2xl font-bold text-foreground">Vrcanje uspešno evidentirano</Text>
          <Text className="mt-2 text-center text-sm leading-5 text-muted">
            {response.createdNewBatch ? 'Kreirana je nova serija meda.' : 'Med je dodat u postojeću seriju.'}
          </Text>
          <View className="mt-6 w-full gap-3 rounded-2xl bg-background px-4 py-4">
            <SummaryRow label="Izvrcano ramova" value={String(response.harvestedFrameCount)} compact />
            <SummaryRow label="Količina meda" value={formatAmount(response.honeyAmount, response.unit)} compact />
            <SummaryRow label="Serija" value={response.batchCode} compact />
          </View>
          </View>
          <View className="mt-6 gap-3">
            <PrimaryButton label="Detalji vrcanja" onPress={() => router.replace({ pathname: '/harvests/[harvestId]', params: { harvestId: response.harvestId } } as never)} />
            <SecondaryButton label="Otvori seriju" onPress={() => router.replace({ pathname: '/honey-batches/[batchId]', params: { batchId: response.honeyBatchId } } as never)} />
            <Pressable accessibilityRole="button" onPress={() => router.replace('/harvests' as never)} className="min-h-12 items-center justify-center">
              <Text className="font-bold text-primary">Nazad na vrcanja</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

function StepIndicator({ step }: { step: CreateStep }) {
  const current = { group: 1, frames: 2, data: 3, confirm: 4, success: 4 }[step];
  return (
    <View className="mb-1 mt-4 flex-row gap-2">
      {[1, 2, 3, 4].map((item) => <View key={item} className={`h-1.5 flex-1 rounded-full ${item <= current ? 'bg-primary' : 'bg-border'}`} />)}
    </View>
  );
}

function SummaryRow({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <View className={`${compact ? '' : 'border-b border-border px-4'} flex-row items-start justify-between gap-4 py-3 last:border-b-0`}>
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="max-w-[58%] text-right text-sm font-bold text-foreground">{value}</Text>
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled = false, className = '' }: { label: string; onPress: () => void; disabled?: boolean; className?: string }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} className={`${className} min-h-14 items-center justify-center rounded-2xl bg-primary px-5 ${disabled ? 'opacity-50' : ''}`}>
      <Text className="text-base font-bold text-background">{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} className={`min-h-14 flex-1 items-center justify-center rounded-2xl border border-border bg-surface px-5 ${disabled ? 'opacity-50' : ''}`}>
      <Text className="text-base font-bold text-foreground">{label}</Text>
    </Pressable>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return <View className="mt-5 rounded-2xl border border-error/30 bg-error/10 px-4 py-3"><Text className="text-sm leading-5 text-error">{message}</Text></View>;
}

function getProblemCode(error: ApiError) {
  const problemCode = error.problem?.code;
  return typeof problemCode === 'string' ? problemCode : null;
}

function isSourceGroupChanged(error: unknown) {
  return error instanceof ApiError && error.status === 409 && getProblemCode(error) === 'harvests.source_group_changed';
}

function getCreateErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const code = getProblemCode(error);
    if (code === 'harvests.insufficient_available_frames') {
      return 'Nema dovoljno dostupnih ramova za izabrano vrcanje.';
    }
    if (error.status === 400) return 'Proverite unete podatke i pokušajte ponovo.';
    if (error.status === 409) return 'Vrcanje nije moguće sačuvati jer su se podaci promenili. Osvežite izbor i pokušajte ponovo.';
  }
  return 'Vrcanje nije moguće sačuvati. Proverite mrežnu vezu i pokušajte ponovo.';
}
