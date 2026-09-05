import Ionicons
  from '@react-native-vector-icons/ionicons';
import {
  router,
} from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  useRelocation,
} from '@/features/relocations/hooks/use-relocation';
import type {
  RelocationDetails,
} from '@/features/relocations/types/relocation-details';
import {
  useAppDrawer,
} from '@/providers/app-drawer-provider';
import {
  AppHeader,
} from '@/shared/components/navigation/app-header';
import {
  LocationMap,
} from '@/shared/components/map-location-picker/location-map';
import {
  Screen,
} from '@/shared/components/screen/screen';
import {
  colors,
} from '@/shared/theme/colors';

type RelocationDetailsScreenProps = {
  relocationId: string;
};

const transportMethodLabels = {
  trailer: 'Prikolica',
  truck: 'Kamion',
  van: 'Kombi',
  other: 'Drugo',
} as const;

const orientationLabels = {
  north: 'sever',
  northEast: 'severoistok',
  east: 'istok',
  southEast: 'jugoistok',
  south: 'jug',
  southWest: 'jugozapad',
  west: 'zapad',
  northWest: 'severozapad',
} as const;

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('sr-RS', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sr-RS', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function RelocationDetailsScreen({
  relocationId,
}: RelocationDetailsScreenProps) {
  const { openDrawer } = useAppDrawer();
  const relocationQuery = useRelocation(relocationId);

  return (
    <Screen header={<AppHeader onMenuPress={openDrawer} />}>
      {relocationQuery.isLoading ? (
        <LoadingState />
      ) : relocationQuery.isError || !relocationQuery.data ? (
        <LoadError
          onRetry={() => {
            void relocationQuery.refetch();
          }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 32,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Nazad na istoriju selidbi"
            onPress={() => router.back()}
            className="self-start py-2"
          >
            <Text className="text-sm font-semibold text-primary">
              ← Selidbe
            </Text>
          </Pressable>

          <Text className="mt-3 text-xs font-bold uppercase tracking-widest text-muted">
            Selidba
          </Text>
          <Text className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            {relocationQuery.data.origin.location.name?.trim() ||
              'Polazište'} → {relocationQuery.data.destination.location.name?.trim() ||
              'Odredište'}
          </Text>
          <Text className="mt-2 text-sm text-muted">
            {formatDateTime(relocationQuery.data.occurredAtUtc)}
          </Text>

          <SectionTitle>Opšti podaci</SectionTitle>
          <GeneralDetails relocation={relocationQuery.data} />

          <SectionTitle>Odredište</SectionTitle>
          <PlaceDetails
            place={relocationQuery.data.destination}
            endedAtUtc={relocationQuery.data.destination.stay.endedAtUtc}
          />

          <SectionTitle>Polazište</SectionTitle>
          <PlaceDetails
            place={relocationQuery.data.origin}
            endedAtUtc={relocationQuery.data.origin.stay.endedAtUtc}
          />
        </ScrollView>
      )}
    </Screen>
  );
}

function GeneralDetails({
  relocation,
}: {
  relocation: RelocationDetails;
}) {
  const relocationKindLabel = relocation.kind === 'wholeApiary'
    ? 'Ceo pčelinjak'
    : `${relocation.hiveCount ?? 0} košnica`;

  return (
    <View className="rounded-3xl border border-border bg-surface px-4 py-4">
      <DetailRow icon="swap-horizontal-outline" label="Obuhvat" value={relocationKindLabel} />
      <DetailRow icon="car-outline" label="Prevoz" value={transportMethodLabels[relocation.transportMethod]} />
      {relocation.distanceKm !== null && (
        <DetailRow icon="navigate-outline" label="Udaljenost" value={`${relocation.distanceKm} km`} />
      )}
      {relocation.costAmount !== null && (
        <DetailRow icon="cash-outline" label="Trošak" value={`${relocation.costAmount} ${relocation.currencyCode ?? ''}`.trim()} />
      )}
      {relocation.notes && (
        <View className="mt-3 border-t border-border pt-3">
          <Text className="text-sm font-semibold text-foreground">Napomena</Text>
          <Text className="mt-1 text-sm leading-5 text-muted">{relocation.notes}</Text>
        </View>
      )}
    </View>
  );
}

function PlaceDetails({
  place,
  endedAtUtc,
}: {
  place: RelocationDetails['origin'];
  endedAtUtc: string | null;
}) {
  const locationName = place.location.name?.trim() || 'Lokacija bez naziva';
  const apiaryName = place.apiary.name?.trim() || 'Pčelinjak bez naziva';

  return (
    <View className="overflow-hidden rounded-3xl border border-border bg-surface">
      <View className="px-4 pb-4 pt-4">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <Ionicons name="business-outline" size={22} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">{apiaryName}</Text>
            <Text className="mt-0.5 text-sm text-muted">{place.apiary.identificationNumber}</Text>
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-background px-3 py-3">
          <Text className="text-sm font-bold text-foreground">{locationName}</Text>
          {place.location.altitudeMeters !== null && (
            <Text className="mt-1 text-sm text-muted">{place.location.altitudeMeters} m n/v</Text>
          )}
          {place.location.cadastralParcelNumber && (
            <Text className="mt-1 text-sm text-muted">Parcela: {place.location.cadastralParcelNumber}</Text>
          )}
          {place.location.description && (
            <Text className="mt-2 text-sm leading-5 text-muted">{place.location.description}</Text>
          )}
        </View>

        <View className="mt-4 gap-3">
          <DetailRow icon="calendar-outline" label="Početak boravka" value={formatDate(place.stay.startedAtUtc)} />
          {endedAtUtc && (
            <DetailRow icon="calendar-clear-outline" label="Kraj boravka" value={formatDate(endedAtUtc)} />
          )}
          {place.stay.orientation && (
            <DetailRow icon="compass-outline" label="Orijentacija ulaza" value={orientationLabels[place.stay.orientation]} />
          )}
          {place.stay.note && (
            <DetailRow icon="chatbox-outline" label="Napomena boravka" value={place.stay.note} />
          )}
        </View>
      </View>

      <View className="border-t border-border">
        <LocationMap
          value={{
            latitude: place.location.latitude,
            longitude: place.location.longitude,
          }}
          onLocationPress={() => undefined}
        />
      </View>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start gap-3 py-1.5">
      <Ionicons name={icon} size={17} color={colors.muted} />
      <Text className="w-28 text-sm text-muted">{label}</Text>
      <Text className="flex-1 text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text className="mb-3 mt-7 text-xl font-bold text-foreground">{children}</Text>;
}

function LoadingState() {
  return <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={colors.primary} /><Text className="mt-3 text-muted">Učitavanje selidbe...</Text></View>;
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return <View className="flex-1 items-center justify-center px-8"><Text className="text-center text-base font-semibold text-error">Nije moguće učitati selidbu.</Text><Pressable accessibilityRole="button" onPress={onRetry} className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-primary px-5"><Text className="font-bold text-background">Pokušaj ponovo</Text></Pressable></View>;
}
