import Ionicons
  from '@react-native-vector-icons/ionicons';
import {
  Image,
} from 'expo-image';
import {
  router,
} from 'expo-router';
import {
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  useDeleteForageObservation,
} from '../hooks/use-delete-forage-observation';
import {
  useForageObservation,
} from '../hooks/use-forage-observation';
import {
  deleteForageObservationPhoto,
  getForageObservationPhotoUri,
} from '../storage/forage-observation-photo';
import type {
  ForageObservation,
} from '../types/forage-observation';

import type {
  ForageType,
} from '@/features/apiaries/types/forage-profile';
import {
  useAppDrawer,
} from '@/providers/app-drawer-provider';
import {
  LocationMap,
} from '@/shared/components/map-location-picker/location-map';
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

type ForageObservationDetailsScreenProps = {
  observationId: string;
};

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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(
    'sr-Latn-RS',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(new Date(value));
}

function intensityLabel(intensity: number) {
  return [
    'Vrlo slaba',
    'Slaba',
    'Srednja',
    'Jaka',
    'Vrlo jaka',
  ][intensity - 1] ?? String(intensity);
}

export function ForageObservationDetailsScreen({
  observationId,
}: ForageObservationDetailsScreenProps) {
  const { openDrawer } = useAppDrawer();
  const observationQuery =
    useForageObservation(observationId);
  const deleteMutation =
    useDeleteForageObservation();

  const header = (
    <AppHeader onMenuPress={openDrawer} />
  );

  if (observationQuery.isLoading) {
    return (
      <Screen header={header}>
        <LoadingState />
      </Screen>
    );
  }

  if (observationQuery.isError || !observationQuery.data) {
    return (
      <Screen header={header}>
        <LoadError
          onRetry={() => {
            void observationQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  const observation = observationQuery.data;

  const handleDelete = () => {
    Alert.alert(
      'Obriši zapažanje',
      'Da li sigurno želite da obrišete ovo zapažanje i lokalnu fotografiju?',
      [
        {
          text: 'Otkaži',
          style: 'cancel',
        },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: () => {
            void deleteMutation
              .mutateAsync(observation.id)
              .then(() => {
                deleteForageObservationPhoto(
                  observation.id,
                );
                router.back();
              })
              .catch(() => {
                Alert.alert(
                  'Brisanje nije uspelo',
                  'Zapažanje nije moguće obrisati. Pokušajte ponovo.',
                );
              });
          },
        },
      ],
    );
  };

  return (
    <Screen
      header={header}
      contextualActionBar={
        <ContextualActionBar
          primaryAction={{
            key: 'observation-details-primary',
            label: '',
            icon: 'ellipse-outline',
            hidden: true,
            onPress: () => undefined,
          }}
          rightActions={[
            {
              key: 'edit-observation',
              label: 'Izmeni',
              icon: 'create-outline',
              accessibilityLabel: 'Izmeni zapažanje',
              onPress: () => {
                router.push({
                  pathname:
                    '/forage-observations/[observationId]/edit',
                  params: {
                    observationId: observation.id,
                  },
                } as never);
              },
            },
            {
              key: 'delete-observation',
              label: 'Obriši',
              icon: 'trash-outline',
              accessibilityLabel: 'Obriši zapažanje',
              variant: 'danger',
              loading: deleteMutation.isPending,
              onPress: handleDelete,
            },
          ]}
        />
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 32,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vrati se na zapažanja"
          onPress={() => router.back()}
          className="mb-3 mt-3 self-start py-2"
        >
          <Text className="text-sm font-semibold text-primary">
            ← Zapažanja
          </Text>
        </Pressable>

        <Text className="text-xs font-bold uppercase tracking-widest text-muted">
          Zapažanje paše
        </Text>
        <View className="mt-1 flex-row flex-wrap items-center gap-2">
          <Text className="text-3xl font-bold tracking-tight text-foreground">
            {forageTypeLabels[observation.forageType]}
          </Text>
          <View className="flex-row items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5">
            <Text className="text-sm font-bold text-primary">
              {observation.intensity}
            </Text>
            <Ionicons
              name="star"
              size={16}
              color={colors.primary}
            />
          </View>
        </View>
        <Text className="mt-2 text-sm text-muted">
          {formatDateTime(observation.observedAt)} · {intensityLabel(observation.intensity)} paša
        </Text>

        <SectionTitle>Fotografija</SectionTitle>
        <ObservationPhoto observation={observation} />

        <SectionTitle>Lokacija</SectionTitle>
        <View className="overflow-hidden rounded-3xl border border-border bg-surface">
          <LocationMap
            value={{
              latitude: observation.latitude,
              longitude: observation.longitude,
            }}
            onLocationPress={() => undefined}
          />
        </View>

        {observation.forageProfileName && (
          <>
            <SectionTitle>Profil paše</SectionTitle>
            <View className="flex-row items-center gap-3 rounded-3xl border border-border bg-surface px-4 py-4">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                <Ionicons
                  name="leaf-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <Text className="flex-1 text-base font-semibold text-foreground">
                {observation.forageProfileName}
              </Text>
            </View>
          </>
        )}

        {observation.notes && (
          <>
            <SectionTitle>Napomena</SectionTitle>
            <View className="rounded-3xl border border-border bg-surface px-4 py-4">
              <Text className="text-base leading-6 text-foreground">
                {observation.notes}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function ObservationPhoto({
  observation,
}: {
  observation: ForageObservation;
}) {
  const photoUri =
    getForageObservationPhotoUri(observation.id);
  const [hasLoadError, setHasLoadError] =
    useState(false);

  if (!photoUri || hasLoadError) {
    return (
      <View className="h-64 items-center justify-center rounded-3xl border border-border bg-surface-warm px-6">
        <Ionicons
          name="image-outline"
          size={40}
          color={colors.muted}
        />
        <Text className="mt-3 text-center text-sm text-muted">
          Fotografija nije dostupna na ovom uređaju.
        </Text>
      </View>
    );
  }

  return (
    <View className="h-64 overflow-hidden rounded-3xl border border-border bg-surface">
      <Image
        source={photoUri}
        contentFit="cover"
        onError={() => setHasLoadError(true)}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </View>
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
        Zapažanje nije moguće učitati.
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

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Text className="mb-3 mt-8 text-lg font-bold text-foreground">
      {children}
    </Text>
  );
}
