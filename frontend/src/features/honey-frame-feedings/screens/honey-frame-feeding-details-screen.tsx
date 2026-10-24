import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useHive } from '@/features/hives/hooks/use-hive';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { environment } from '@/shared/config/environment';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { colors } from '@/shared/theme/colors';

import { useHoneyFrameFeeding } from '../hooks/use-honey-frame-feeding';
import type { HoneyFrameFeedingDetails } from '../types/honey-frame-feeding';

type HoneyFrameFeedingDetailsScreenProps = {
  hiveId: string;
  feedingId: string;
};

export function HoneyFrameFeedingDetailsScreen({
  hiveId,
  feedingId,
}: HoneyFrameFeedingDetailsScreenProps) {
  const { openDrawer } = useAppDrawer();
  const hiveQuery = useHive(hiveId);
  const feedingQuery = useHoneyFrameFeeding(hiveId, feedingId);

  if (hiveQuery.isLoading || feedingQuery.isLoading) {
    return <LoadingState />;
  }

  if (hiveQuery.isError || feedingQuery.isError || !hiveQuery.data || !feedingQuery.data) {
    return (
      <ErrorState
        onRetry={() => {
          void Promise.all([hiveQuery.refetch(), feedingQuery.refetch()]);
        }}
      />
    );
  }

  return (
    <Screen header={<AppHeader onMenuPress={openDrawer} />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 40,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vrati se na istoriju aktivnosti"
          onPress={() => router.back()}
          className="mb-3 min-h-11 self-start justify-center py-2"
        >
          <Text className="text-base font-semibold text-primary">← Istorija aktivnosti</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-foreground">Prihrana ramovima meda</Text>
        <Text className="mt-1 text-sm leading-5 text-muted">
          Evidentirani podaci o prihrani za košnicu {hiveQuery.data.label}.
        </Text>

        <Details feeding={feedingQuery.data} />
      </ScrollView>
    </Screen>
  );
}

function Details({ feeding }: { feeding: HoneyFrameFeedingDetails }) {
  const rows = [
    {
      label: 'Datum i vreme prihrane',
      value: formatDateTime(feeding.performedAt),
    },
    {
      label: 'Dato ramova meda',
      value: formatFrames(feeding.frameCount),
    },
    {
      label: 'Poreklo ramova',
      value: feeding.frameSource?.trim() || 'Nije navedeno',
    },
    {
      label: 'Način evidencije',
      value: feeding.actionGroupId ? 'Grupna akcija' : 'Pojedinačna akcija',
    },
  ];

  return (
    <>
      <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Podaci o prihrani</Text>
      <View className="rounded-3xl border border-border bg-surface px-5 py-1">
        {rows.map((row, index) => (
          <View
            key={row.label}
            className={`flex-row items-start justify-between gap-6 py-3 ${
              index === rows.length - 1 ? '' : 'border-b border-border'
            }`}
          >
            <Text className="flex-1 text-sm text-muted">{row.label}</Text>
            <Text className="flex-1 text-right text-sm font-semibold text-foreground">
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      {feeding.notes?.trim() && (
        <>
          <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Napomena</Text>
          <View className="rounded-3xl border border-border bg-surface px-5 py-4">
            <Text className="text-base leading-6 text-foreground">{feeding.notes.trim()}</Text>
          </View>
        </>
      )}

      {feeding.imageUrl && (
        <>
          <Text className="mb-3 mt-7 text-lg font-bold text-foreground">Fotografija</Text>
          <View className="h-64 overflow-hidden rounded-3xl border border-border bg-surface">
            <Image
              source={`${environment.apiUrl}${feeding.imageUrl}`}
              contentFit="cover"
              style={{ width: '100%', height: '100%' }}
            />
          </View>
        </>
      )}
    </>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('sr-Latn-RS', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatFrames(value: number) {
  return `${value} ${value === 1 ? 'ram' : value >= 2 && value <= 4 ? 'rama' : 'ramova'}`;
}

function LoadingState() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-3 text-muted">Učitavanje prihrane...</Text>
      </View>
    </Screen>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-center text-base font-semibold text-error">
          Nije moguće učitati prihranu.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-primary px-5"
        >
          <Text className="font-bold text-background">Pokušaj ponovo</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
