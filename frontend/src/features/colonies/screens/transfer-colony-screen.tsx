import { zodResolver } from '@hookform/resolvers/zod';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { HiveHeaderIllustration } from '@/features/hives/components/hive-header-illustration';
import { ApiError } from '@/shared/api/api-error';
import { colors } from '@/shared/theme/colors';

import { useCurrentColony } from '../hooks/use-current-colony';
import { useTransferColony } from '../hooks/use-transfer-colony';
import { useTransferDestinations } from '../hooks/use-transfer-destinations';
import { transferColonySchema } from '../schemas/transfer-colony-schema';
import type { TransferColonyFormValues } from '../schemas/transfer-colony-schema';
import type { TransferDestinationHive } from '../types/transfer-colony';

type TransferColonyScreenProps = {
  hiveId: string;
  colonyId: string;
};

function getToday() {
  return formatDateOnly(new Date());
}

function formatDateOnly(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  return year && month && day ? new Date(year, month - 1, day) : new Date();
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-');

  return year && month && day ? `${day}.${month}.${year}.` : 'Izaberite datum';
}

function getTransferErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'Premeštanje društva nije uspelo. Proverite vezu i pokušajte ponovo.';
  }

  if (error.status === 400) {
    return 'Proverite ciljnu košnicu i datum premeštanja.';
  }

  if (error.status === 404) {
    return 'Društvo ili izabrana košnica više nisu dostupni.';
  }

  if (error.status === 409) {
    switch (error.problem?.code) {
      case 'colonies.destination_hive_occupied':
        return 'Ciljna košnica je u međuvremenu zauzeta drugim društvom.';
      case 'colonies.invalid_active_stay_state':
        return 'Društvo više nema važeći aktivni boravak za premeštanje.';
      default:
        return 'Premeštanje trenutno nije moguće. Osvežite podatke i pokušajte ponovo.';
    }
  }

  return 'Premeštanje društva nije uspelo. Pokušajte ponovo.';
}

export function TransferColonyScreen({ hiveId, colonyId }: TransferColonyScreenProps) {
  const currentColonyQuery = useCurrentColony(hiveId);
  const destinationsQuery = useTransferDestinations(colonyId);
  const transferMutation = useTransferColony();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TransferColonyFormValues>({
    resolver: zodResolver(transferColonySchema),
    defaultValues: {
      destinationHiveId: '',
      transferredOn: getToday(),
    },
  });
  const destinationHiveId = useWatch({
    control,
    name: 'destinationHiveId',
  });

  const submitTransfer = async (values: TransferColonyFormValues) => {
    const currentColony = currentColonyQuery.data;
    const destination = destinationsQuery.data?.find(
      (hive) => hive.id === values.destinationHiveId,
    );

    if (!destination) {
      setError('destinationHiveId', {
        message: 'Izaberite slobodnu košnicu.',
      });
      return;
    }

    if (!currentColony || currentColony.id !== colonyId) {
      setServerError('Društvo više nije u ovoj košnici. Osvežite podatke i pokušajte ponovo.');
      return;
    }

    if (values.transferredOn < currentColony.startedOn) {
      setError('transferredOn', {
        message: 'Datum premeštanja ne može biti pre početka trenutnog boravka.',
      });
      return;
    }

    setServerError(null);

    try {
      const result = await transferMutation.mutateAsync({
        colonyId,
        request: values,
      });

      router.replace({
        pathname: '/hives/[hiveId]',
        params: { hiveId: result.destinationHiveId },
      } as never);
    } catch (error) {
      const apiError = error instanceof ApiError ? error.problem?.errors : undefined;
      const destinationError = apiError?.DestinationHiveId?.[0] ?? apiError?.destinationHiveId?.[0];
      const dateError = apiError?.TransferredOn?.[0] ?? apiError?.transferredOn?.[0];

      if (destinationError) {
        setError('destinationHiveId', {
          message: 'Izaberite slobodnu košnicu različitu od trenutne.',
        });
      }

      if (dateError) {
        setError('transferredOn', {
          message: 'Proverite datum premeštanja.',
        });
      }

      setServerError(getTransferErrorMessage(error));
    }
  };

  if (destinationsQuery.isLoading || currentColonyQuery.isLoading) {
    return <LoadingState label="Učitavanje košnica..." />;
  }

  if (
    destinationsQuery.isError ||
    currentColonyQuery.isError ||
    !destinationsQuery.data ||
    !currentColonyQuery.data ||
    currentColonyQuery.data.id !== colonyId
  ) {
    return (
      <LoadError
        onRetry={() => {
          void Promise.all([destinationsQuery.refetch(), currentColonyQuery.refetch()]);
        }}
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={destinationsQuery.data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <TransferHeader
            onBack={() => {
              router.back();
            }}
          />
        }
        ListEmptyComponent={
          <View className="rounded-3xl border border-border bg-surface px-5 py-6">
            <Text className="text-center text-base font-semibold text-foreground">
              Nema slobodnih košnica u trenutnom pčelinjaku.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Controller
            control={control}
            name="destinationHiveId"
            render={({ field }) => (
              <DestinationHiveCard
                hive={item}
                selected={field.value === item.id}
                onSelect={() => {
                  field.onChange(item.id);
                }}
              />
            )}
          />
        )}
        ListFooterComponent={
          <View className="pt-4">
            {errors.destinationHiveId && (
              <Text className="mb-4 text-sm text-error">{errors.destinationHiveId.message}</Text>
            )}

            <Controller
              control={control}
              name="transferredOn"
              render={({ field }) => (
                <TransferDateField
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.transferredOn?.message}
                />
              )}
            />

            {serverError && (
              <View className="mb-4 rounded-2xl border border-error/30 bg-surface px-4 py-3">
                <Text className="text-sm leading-5 text-error">{serverError}</Text>
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={transferMutation.isPending || !destinationHiveId}
              onPress={handleSubmit(submitTransfer)}
              className={`min-h-14 items-center justify-center rounded-2xl bg-primary px-5 ${transferMutation.isPending || !destinationHiveId ? 'opacity-60' : ''}`}
            >
              <Text className="text-base font-bold text-background">
                {transferMutation.isPending ? 'Premeštanje...' : 'Premesti društvo'}
              </Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

function TransferHeader({ onBack }: { onBack: () => void }) {
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Nazad"
        onPress={onBack}
        className="mb-5 self-start py-2"
      >
        <Text className="text-base font-semibold text-primary">← Nazad</Text>
      </Pressable>

      <Text className="text-2xl font-bold text-foreground">Premesti društvo</Text>
      <Text className="mt-1 text-sm leading-5 text-muted">
        Izaberite slobodnu košnicu. Matica ostaje povezana sa društvom i prelazi zajedno sa njim.
      </Text>

      <Text className="mb-3 mt-8 text-lg font-bold text-foreground">Ciljna košnica</Text>
    </View>
  );
}

function DestinationHiveCard({
  hive,
  selected,
  onSelect,
}: {
  hive: TransferDestinationHive;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onSelect}
      className={`mb-3 min-h-24 flex-row items-center rounded-3xl border px-4 py-3 ${selected ? 'border-primary bg-primary/10' : 'border-border bg-surface'}`}
    >
      <HiveHeaderIllustration colorHex={hive.colorHex} size={52} accessible={false} />
      <View className="ml-4 flex-1">
        <Text className="text-base font-bold text-foreground">{hive.label}</Text>
        <Text className="mt-1 text-sm text-muted">
          {hive.identificationNumber ?? 'Bez identifikacionog broja'}
        </Text>
        <Text className="mt-1 text-xs font-semibold text-success">Slobodna</Text>
      </View>
      <View
        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${selected ? 'border-primary bg-primary' : 'border-border'}`}
      >
        {selected && <Text className="text-xs font-bold text-background">✓</Text>}
      </View>
    </Pressable>
  );
}

function TransferDateField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-foreground">Datum premeštanja</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Izaberite datum premeštanja"
        onPress={() => {
          setIsPickerVisible(true);
        }}
        className={`min-h-14 justify-center rounded-2xl border bg-surface px-4 ${error ? 'border-error' : 'border-border'}`}
      >
        <Text className="text-base text-foreground">{formatDate(value)}</Text>
      </Pressable>

      {isPickerVisible && (
        <DateTimePicker
          value={parseDateOnly(value)}
          mode="date"
          maximumDate={new Date()}
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

function LoadingState({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="mt-3 text-muted">{label}</Text>
    </View>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <Text className="text-center text-base font-semibold text-error">
        Nije moguće učitati dostupne košnice.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        className="mt-5 rounded-2xl bg-primary px-5 py-3"
      >
        <Text className="font-bold text-background">Pokušaj ponovo</Text>
      </Pressable>
    </View>
  );
}
