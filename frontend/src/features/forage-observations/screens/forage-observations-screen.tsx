import Ionicons
  from '@react-native-vector-icons/ionicons';
import {
  Image,
} from 'expo-image';
import {
  router,
} from 'expo-router';
import {
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  useForageObservations,
} from '../hooks/use-forage-observations';
import type {
  ForageObservation,
} from '../types/forage-observation';
import {
  getForageObservationPhotoUri,
} from '../storage/forage-observation-photo';

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
  useAppDrawer,
} from '@/providers/app-drawer-provider';
import type {
  ForageType,
} from '@/features/apiaries/types/forage-profile';

const forageTypeLabels: Record<ForageType, string> = {
  meadow: 'Livada',
  forest: 'Šuma',
  sunflower: 'Suncokret',
  acacia: 'Bagrem',
  linden: 'Lipa',
  oilseedRape: 'Uljana repica',
  clover: 'Detelina',
  fruitTrees: 'Voćke',
  chestnut: 'Kesten',
  buckwheat: 'Heljda',
  other: 'Ostalo',
};

function formatObservationDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    'sr-Latn-RS',
    {
      day: '2-digit',
      month: 'short',
    },
  ).format(new Date(value));
}

function formatObservationTime(
  value: string,
) {
  return new Intl.DateTimeFormat(
    'sr-Latn-RS',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(new Date(value));
}

function intensityLabel(
  intensity: number,
) {
  return [
    'Vrlo slaba',
    'Slaba',
    'Srednja',
    'Jaka',
    'Vrlo jaka',
  ][intensity - 1] ?? String(intensity);
}

export function ForageObservationsScreen() {
  const {
    openDrawer,
  } = useAppDrawer();
  const observationsQuery =
    useForageObservations();
  const observations =
    observationsQuery.data?.pages.flatMap(
      (page) => page.items,
    ) ?? [];

  return (
    <Screen
      header={
        <AppHeader onMenuPress={openDrawer} />
      }
      contextualActionBar={
        <ContextualActionBar
          primaryAction={{
            key: 'capture-observation',
            label: 'Zapažanje',
            icon: 'camera-outline',
            accessibilityLabel:
              'Zabeleži novo zapažanje paše',
            onPress: () => {
              router.push(
                '/forage-observations/create',
              );
            },
          }}
        />
      }
    >
      {observationsQuery.isLoading ? (
        <LoadingState />
      ) : observationsQuery.isError ? (
        <LoadError
          onRetry={() => {
            void observationsQuery.refetch();
          }}
        />
      ) : (
        <FlatList
          data={observations}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 32,
            flexGrow:
              observations.length === 0 ? 1 : undefined,
          }}
          ListHeaderComponent={
            <View className="mb-7">
              <Text className="text-2xl font-bold tracking-tight text-foreground">
                Zapažanja paše
              </Text>
              <Text className="mt-1 text-sm text-muted">
                Vaša terenska zapažanja, od najnovijeg.
              </Text>
            </View>
          }
          ListEmptyComponent={<EmptyState />}
          renderItem={({ item, index }) => (
            <ObservationTimelineItem
              observation={item}
              isLast={index === observations.length - 1}
            />
          )}
          onEndReached={() => {
            if (
              observationsQuery.hasNextPage &&
              !observationsQuery.isFetchingNextPage
            ) {
              void observationsQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            observationsQuery.isFetchingNextPage ? (
              <ActivityIndicator
                className="my-5"
                color={colors.primary}
              />
            ) : null
          }
        />
      )}
    </Screen>
  );
}

function ObservationTimelineItem({
  observation,
  isLast,
}: {
  observation: ForageObservation;
  isLast: boolean;
}) {
  const photoUri =
    getForageObservationPhotoUri(
      observation.id,
    );

  return (
    <View className="flex-row">
      <View className="w-16 items-end pr-3">
        <Text className="text-right text-xs font-bold text-foreground">
          {formatObservationDate(observation.observedAt)}
        </Text>
        <Text className="mt-1 text-right text-xs text-muted">
          {formatObservationTime(observation.observedAt)}
        </Text>
      </View>

      <View className="relative w-7 items-center">
        {!isLast && (
          <View className="absolute bottom-0 top-4 w-px bg-border" />
        )}
        <View className="z-10 mt-1 h-4 w-4 rounded-full border-4 border-background bg-primary" />
      </View>

      <View className="mb-5 flex-1 overflow-hidden rounded-3xl border border-border bg-surface">
        <View className="flex-row">
          <View className="flex-1 px-4 py-4">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="text-base font-bold text-foreground">
                {forageTypeLabels[observation.forageType]}
              </Text>
              <View className="flex-row items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1">
                <Text className="text-xs font-bold text-primary">
                  {observation.intensity}
                </Text>
                <Ionicons
                  name="star"
                  size={13}
                  color={colors.primary}
                />
              </View>
            </View>
            <Text className="mt-1 text-sm text-muted">
              Jačina: {intensityLabel(observation.intensity)}
            </Text>

            {observation.forageProfileName && (
              <View className="mt-3 flex-row items-center gap-2">
                <Ionicons
                  name="leaf-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text className="flex-1 text-sm text-muted">
                  {observation.forageProfileName}
                </Text>
              </View>
            )}

            {observation.notes && (
              <Text className="mt-3 text-sm leading-5 text-foreground">
                {observation.notes}
              </Text>
            )}
          </View>

          <ObservationPhoto photoUri={photoUri} />
        </View>
      </View>
    </View>
  );
}

function ObservationPhoto({
  photoUri,
}: {
  photoUri: string | null;
}) {
  const [hasLoadError, setHasLoadError] =
    useState(false);

  useEffect(() => {
    setHasLoadError(false);
  }, [photoUri]);

  if (!photoUri || hasLoadError) {
    return (
      <View
        className="shrink-0 items-center justify-center bg-surface-warm"
        style={{
          alignSelf: 'stretch',
          width: 104,
        }}
      >
        <Ionicons
          name="image-outline"
          size={28}
          color={colors.muted}
        />
        <Text className="mt-2 px-2 text-center text-[11px] font-medium text-muted">
          Fotografija nije dostupna na ovom uređaju
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={photoUri}
      contentFit="cover"
      onError={() => {
        setHasLoadError(true);
      }}
      style={{
        alignSelf: 'stretch',
        width: 104,
      }}
    />
  );
}

function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="mt-3 text-muted">
        Učitavanje zapažanja...
      </Text>
    </View>
  );
}

function LoadError({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-base font-semibold text-error">
        Nije moguće učitati zapažanja.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-primary px-5"
      >
        <Text className="font-bold text-background">
          Pokušaj ponovo
        </Text>
      </Pressable>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center rounded-3xl border border-border bg-surface px-6 py-10">
      <View className="h-16 w-16 items-center justify-center rounded-3xl bg-primary/10">
        <Ionicons
          name="leaf-outline"
          size={32}
          color={colors.primary}
        />
      </View>
      <Text className="mt-5 text-center text-xl font-bold text-foreground">
        Još nema zapažanja
      </Text>
      <Text className="mt-2 text-center text-base leading-6 text-muted">
        Zabeležite prvo terensko zapažanje paše pomoću centralnog dugmeta.
      </Text>
    </View>
  );
}
