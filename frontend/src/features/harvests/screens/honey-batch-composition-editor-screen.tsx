import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { ApiError } from '@/shared/api/api-error';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';
import { CompositionEditor } from '../components/composition-editor';
import { HarvestErrorState, HarvestLoadingState } from '../components/harvest-screen-states';
import { useHoneyBatch } from '../hooks/use-honey-batch';
import { useSetLaboratoryHoneyBatchComposition } from '../hooks/use-set-laboratory-honey-batch-composition';
import { useSetManualHoneyBatchComposition } from '../hooks/use-set-manual-honey-batch-composition';
import {
  laboratoryHoneyBatchCompositionSchema,
  manualHoneyBatchCompositionSchema,
  type HoneyBatchCompositionFormInput,
} from '../schemas/honey-batch-composition.schema';

type CompositionEditorMode = 'manual' | 'laboratory';

export function HoneyBatchCompositionEditorScreen({
  batchId,
  mode,
}: {
  batchId: string;
  mode: CompositionEditorMode;
}) {
  const { openDrawer } = useAppDrawer();
  const batchQuery = useHoneyBatch(batchId);
  const manualMutation = useSetManualHoneyBatchComposition();
  const laboratoryMutation = useSetLaboratoryHoneyBatchComposition();
  const mutation = mode === 'manual' ? manualMutation : laboratoryMutation;
  const form = useForm<HoneyBatchCompositionFormInput>({
    resolver: zodResolver(
      mode === 'manual' ? manualHoneyBatchCompositionSchema : laboratoryHoneyBatchCompositionSchema,
    ),
    defaultValues: {
      evidenceReference: '',
      items: [],
    },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });
  const hydratedCompositionKey = useRef<string | null>(null);
  const { reset } = form;

  useEffect(() => {
    if (!batchQuery.data) return;

    const composition = batchQuery.data.currentComposition;
    const key = `${batchId}:${composition?.id ?? ''}`;
    if (hydratedCompositionKey.current === key) return;
    hydratedCompositionKey.current = key;

    reset({
      evidenceReference: '',
      items:
        composition?.items.map((item) => ({
          forageType: item.forageType,
          percentage: String(item.percentage),
          notes: item.notes ?? '',
        })) ?? [],
    });
  }, [batchId, batchQuery.data, reset]);

  const onSubmit = async (values: HoneyBatchCompositionFormInput) => {
    const items = values.items.map((item) => ({
      forageType: item.forageType.trim(),
      percentage: Number(item.percentage),
      notes: item.notes.trim() || null,
    }));

    try {
      if (mode === 'manual') {
        await manualMutation.mutateAsync({ batchId, request: { items } });
        Alert.alert('Sastav meda je sačuvan.', '', [
          { text: 'U redu', onPress: () => router.back() },
        ]);
      } else {
        await laboratoryMutation.mutateAsync({
          batchId,
          request: { evidenceReference: values.evidenceReference?.trim() ?? '', items },
        });
        Alert.alert('Laboratorijski sastav je sačuvan.', '', [
          { text: 'U redu', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      Alert.alert(
        mode === 'manual' ? 'Sastav nije sačuvan' : 'Laboratorijski sastav nije sačuvan',
        getSaveErrorMessage(error),
      );
    }
  };

  if (batchQuery.isLoading)
    return (
      <Screen header={<AppHeader onMenuPress={openDrawer} />}>
        <HarvestLoadingState label="Učitavanje serije meda..." />
      </Screen>
    );
  if (batchQuery.isError || !batchQuery.data)
    return (
      <Screen header={<AppHeader onMenuPress={openDrawer} />}>
        <HarvestErrorState
          message="Seriju meda nije moguće učitati."
          onRetry={() => void batchQuery.refetch()}
        />
      </Screen>
    );

  const title = mode === 'manual' ? 'Ručni sastav meda' : 'Laboratorijski sastav';
  const saveLabel = mode === 'manual' ? 'Sačuvaj sastav' : 'Sačuvaj laboratorijski sastav';

  return (
    <Screen header={<AppHeader onMenuPress={openDrawer} />}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vrati se na seriju meda"
          disabled={mutation.isPending}
          onPress={() => router.back()}
          className="mb-3 min-h-11 self-start justify-center py-2"
        >
          <Text className="text-sm font-semibold text-primary">← Serija meda</Text>
        </Pressable>
        <Text className="text-2xl font-bold tracking-tight text-foreground">{title}</Text>
        <Text className="mt-1 text-sm leading-5 text-muted">
          {mode === 'manual'
            ? 'Unesite sastav koji ste utvrdili za ovu seriju meda.'
            : 'Evidentirajte sastav na osnovu spoljnog laboratorijskog nalaza.'}
        </Text>

        {mode === 'laboratory' && (
          <View className="mt-7 rounded-3xl border border-border bg-surface px-4 py-4">
            <Text className="mb-2 text-base font-bold text-foreground">
              Podaci o laboratorijskom nalazu
            </Text>
            <Text className="mb-3 text-sm leading-5 text-muted">
              Unesite naziv laboratorije, broj izveštaja ili drugu oznaku dokumenta.
            </Text>
            <Controller
              control={form.control}
              name="evidenceReference"
              render={({ field }) => (
                <>
                  <TextInput
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    multiline
                    textAlignVertical="top"
                    maxLength={1000}
                    placeholder="Laboratorija XYZ, izveštaj LAB-2026-00841, analiza od 10.09.2026."
                    placeholderTextColor={colors.muted}
                    className={`min-h-28 rounded-2xl border bg-background px-4 py-3 text-base text-foreground ${form.formState.errors.evidenceReference ? 'border-error' : 'border-border'}`}
                  />
                  {form.formState.errors.evidenceReference && (
                    <Text className="mt-1 text-sm text-error">
                      {form.formState.errors.evidenceReference.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>
        )}

        <View className="mt-7">
          <CompositionEditor
            control={form.control}
            fields={fields}
            append={append}
            remove={remove}
            errors={form.formState.errors}
          />
        </View>
        <View className="mt-7 gap-3">
          <Pressable
            accessibilityRole="button"
            disabled={mutation.isPending}
            onPress={() => router.back()}
            className={`min-h-13 items-center justify-center rounded-2xl border border-border bg-surface px-5 ${mutation.isPending ? 'opacity-60' : ''}`}
          >
            <Text className="text-base font-bold text-foreground">Otkaži</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={mutation.isPending}
            onPress={() => void form.handleSubmit(onSubmit)()}
            className={`min-h-14 items-center justify-center rounded-2xl bg-primary px-5 ${mutation.isPending ? 'opacity-60' : ''}`}
          >
            {mutation.isPending ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color={colors.onPrimary} />
                <Text className="text-base font-bold text-background">Čuvanje...</Text>
              </View>
            ) : (
              <Text className="text-base font-bold text-background">{saveLabel}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

function getSaveErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 404) return 'Serija meda nije pronađena ili joj više nemate pristup.';
    if (error.status === 409) return 'Serija meda mora biti završena pre određivanja sastava.';
    if (error.status === 400) return 'Proverite označena polja i pokušajte ponovo.';
  }
  return 'Sastav meda nije moguće sačuvati. Pokušajte ponovo.';
}
