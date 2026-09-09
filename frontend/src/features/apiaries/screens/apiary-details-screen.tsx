import {
  router,
} from 'expo-router';
import Ionicons
  from '@react-native-vector-icons/ionicons';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Alert,
  Text,
  View,
} from 'react-native';
import {
  useMemo,
  useState,
} from 'react';
import {
  useApiary,
} from '@/features/apiaries/hooks/use-apiary';
import {
  useCurrentApiaryStay,
} from '@/features/apiaries/hooks/use-current-apiary-stay';
import {
  useDeactivateApiary,
} from '@/features/apiaries/hooks/use-deactivate-apiary';
import {
  useLocation,
} from '@/features/apiaries/hooks/use-location';
import type {
  CurrentApiaryStay,
  HiveEntranceOrientation,
} from '@/features/apiaries/types/apiary-stay';
import type {
  ApiaryLocation,
} from '@/features/apiaries/types/location';
import {
  ApiaryHeaderImage,
} from '@/features/apiaries/components/apiary-header-image';

import {
  HiveCard,
} from '@/features/hives/components/hive-card';
import {
  HiveListFilters,
} from '@/features/hives/components/hive-list-filters';

import {
  useHives,
} from '@/features/hives/hooks/use-hives';
import type {
  HiveStatus,
  HiveType,
} from '@/features/hives/types/hive';

import {
  useAppDrawer,
} from '@/providers/app-drawer-provider';
import {
  useAuth,
} from '@/features/auth/hooks/use-auth';

import {
  AppHeader,
} from '@/shared/components/navigation/app-header';
import {
  LocationMap,
} from '@/shared/components/map-location-picker/location-map';

import {
  colors,
} from '@/shared/theme/colors';
import {
  ActionOverflowSheet,
} from '@/shared/components/contextual-action-bar/action-overflow-sheet';

import {
  ContextualActionBar,
} from '@/shared/components/contextual-action-bar/contextual-action-bar';

import {
  Screen,
} from '@/shared/components/screen/screen';

type ApiaryHivesScreenProps = {
  apiaryId: string;
};

function getApiaryTypeLabel(
  type:
    | 'stationary'
    | 'migratory'
    | null,
) {
  switch (type) {
    case 'stationary':
      return 'Stacionarni';

    case 'migratory':
      return 'Seleći';

    default:
      return null;
  }
}

export function ApiaryHivesScreen({
  apiaryId,
}: ApiaryHivesScreenProps) {
  const {
    openDrawer,
  } = useAppDrawer();
  const {
    isRefreshingSession,
  } = useAuth();

  const [
    isMoreOpen,
    setIsMoreOpen,
  ] = useState(false);
  const [
    isApiaryActionsOpen,
    setIsApiaryActionsOpen,
  ] = useState(false);
  const deactivateApiaryMutation =
    useDeactivateApiary();
  const currentStayQuery =
    useCurrentApiaryStay(apiaryId);
  const locationQuery =
    useLocation(
      currentStayQuery.data?.locationId ?? '',
    );
  const [
    labelSearch,
    setLabelSearch,
  ] = useState('');
  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<HiveStatus | null>(null);
  const [
    selectedType,
    setSelectedType,
  ] = useState<HiveType | null>(null);
  const [
    selectedColor,
    setSelectedColor,
  ] = useState<string | null | undefined>(undefined);

  const {
    data: apiary,
    isLoading:
    isApiaryLoading,
    isError:
    isApiaryError,
    fetchStatus:
    apiaryFetchStatus,
    refetch:
    refetchApiary,
  } =
    useApiary(
      apiaryId,
    );

  const {
    data: hives,
    isLoading:
    areHivesLoading,
    isError:
    areHivesError,
    fetchStatus:
    hivesFetchStatus,
    refetch:
    refetchHives,
  } =
    useHives(
      apiaryId,
    );

  const isQueryPaused =
    apiaryFetchStatus === 'paused' ||
    hivesFetchStatus === 'paused';

  const retryLoading = () => {
    void Promise.all([
      refetchApiary(),
      refetchHives(),
    ]);
  };

  const header = (
    <AppHeader
      onMenuPress={
        openDrawer
      }
    />
  );

  if (
    isApiaryLoading ||
    areHivesLoading
  ) {
    return (
      <Screen
        header={header}
      >
        <View
          className="
            flex-1
            items-center
            justify-center
          "
        >
          <ActivityIndicator
            size="large"
            color={
              colors.primary
            }
          />

          <Text
            className="
              mt-3
              text-muted
            "
          >
            {isRefreshingSession
              ? 'Obnavljanje sesije...'
              : 'Učitavanje košnica...'}
          </Text>
        </View>
      </Screen>
    );
  }

  if (
    isQueryPaused &&
    (!apiary || !hives)
  ) {
    return (
      <Screen
        header={header}
      >
        <LoadError
          message="Nema mrežne veze. Proverite vezu i pokušajte ponovo."
          onRetry={retryLoading}
        />
      </Screen>
    );
  }

  if (
    isApiaryError ||
    areHivesError ||
    !apiary ||
    !hives
  ) {
    return (
      <Screen
        header={header}
      >
        <LoadError
          message="Nije moguće učitati podatke o pčelinjaku."
          onRetry={retryLoading}
        />
      </Screen>
    );
  }

  const displayName =
    apiary.name?.trim() ||
    'Pčelinjak bez naziva';

  const typeLabel =
    getApiaryTypeLabel(
      apiary.type,
    );

  const availableColors = useMemo(
    () => Array.from(
      new Set(
        hives
          .map((hive) => hive.colorHex)
          .filter((color): color is string => color !== null),
      ),
    ).sort(),
    [hives],
  );

  const filteredHives = useMemo(() => {
    const normalizedSearch = labelSearch
      .trim()
      .toLocaleLowerCase('sr-Latn-RS');

    return hives.filter((hive) => {
      const matchesLabel = !normalizedSearch || hive.label
        .toLocaleLowerCase('sr-Latn-RS')
        .includes(normalizedSearch);
      const matchesStatus = !selectedStatus || hive.status === selectedStatus;
      const matchesType = !selectedType || hive.type === selectedType;
      const matchesColor = selectedColor === undefined || hive.colorHex === selectedColor;

      return matchesLabel && matchesStatus && matchesType && matchesColor;
    });
  }, [hives, labelSearch, selectedColor, selectedStatus, selectedType]);

  const handleAddHive = () => {
    router.push({
      pathname:
        '/apiaries/[apiaryId]/hives/create',

      params: {
        apiaryId,
      },
    });
  };

  const handleForagePress = () => {
    router.push({
      pathname:
        '/apiaries/[apiaryId]/forage-profiles',

      params: {
        apiaryId,
      },
    } as never);
  };

  const handleRelocationsPress = () => {
    router.push({
      pathname: '/apiaries/[apiaryId]/relocations',
      params: {
        apiaryId,
      },
    });
  };

  const handleApiaryActionsPress = () => {
    setIsApiaryActionsOpen(true);
  };

  const handleStayHistoryPress = () => {
    setIsMoreOpen(false);

    router.push({
      pathname: '/apiaries/[apiaryId]/stays',
      params: {
        apiaryId,
      },
    });
  };

  const handleScanPress = () => {
    Alert.alert(
      'Skeniranje',
      'Skeniranje QR ili bar koda biće dodato kasnije.',
    );
  };

  const handleEditPress = () => {
    setIsMoreOpen(
      false,
    );

    router.push({
      pathname:
        '/apiaries/[apiaryId]/edit',

      params: {
        apiaryId,
      },
    });
  };

  const handleDeactivatePress = () => {
    setIsMoreOpen(false);

    Alert.alert(
      'Deaktiviraj pčelinjak',
      'Pčelinjak će zauvek ostati deaktiviran. Neće se prikazivati na podrazumevanoj listi i više mu nećete moći pristupiti.',
      [
        {
          text: 'Otkaži',
          style: 'cancel',
        },
        {
          text: 'Deaktiviraj',
          style:
            'destructive',

          onPress: () => {
            void deactivateApiaryMutation
              .mutateAsync(apiaryId)
              .then(() => {
                router.replace('/');
              })
              .catch(() => {
                Alert.alert(
                  'Deaktivacija nije uspela',
                  'Pokušajte ponovo.',
                );
              });
          },
        },
      ],
    );
  };

  return (
    <>
      <Screen
        header={header}
        contextualActionBar={
          <ContextualActionBar
            leftActions={[
              {
                key: 'forage',
                label: 'Paša',
                icon:
                  'leaf-outline',

                accessibilityLabel:
                  'Otvori profil paše',

                onPress:
                  handleForagePress,
              },

              {
                key:
                  'relocations',

                label:
                  'Selidbe',

                icon:
                  'swap-horizontal-outline',

                accessibilityLabel:
                  'Prikaži istoriju selidbi pčelinjaka',

                onPress:
                  handleRelocationsPress,
              },
            ]}
            primaryAction={{
              key:
                'actions',

              label:
                'Akcije',

              icon: 'construct-outline',

              accessibilityLabel:
                'Otvori akcije nad pčelinjakom',

              onPress:
                handleApiaryActionsPress,
            }}
            rightActions={[
              {
                key: 'scan',

                label:
                  'Skeniraj',

                icon:
                  'scan-outline',

                accessibilityLabel:
                  'Skeniraj QR ili bar kod',

                onPress:
                  handleScanPress,
              },

              {
                key: 'more',

                label:
                  'Više',

                icon:
                  'ellipsis-horizontal',

                accessibilityLabel:
                  'Prikaži više opcija za pčelinjak',

                onPress: () => {
                  setIsMoreOpen(
                    true,
                  );
                },
              },
            ]}
          />
        }
      >
        <FlatList
          data={filteredHives}
          keyExtractor={(
            hive,
          ) => hive.id}
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={{
            paddingHorizontal:
              16,

            paddingBottom:
              24,
          }}
          ItemSeparatorComponent={() => (
            <View
              className="h-3"
            />
          )}
          ListHeaderComponent={
            <View>
              <Pressable
                onPress={() => {
                  router.back();
                }}
                className="
                  mb-3
                  mt-3
                  self-start
                  py-2
                "
              >
                <Text
                  className="
                    text-sm
                    font-semibold
                    text-primary
                  "
                >
                  ← Pčelinjaci
                </Text>
              </Pressable>

              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1 pt-1">
                  <Text
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-widest
                      text-muted
                    "
                  >
                    Pčelinjak
                  </Text>

                  <Text
                    numberOfLines={3}
                    className="
                      mt-1
                      text-3xl
                      font-bold
                      tracking-tight
                      text-foreground
                    "
                  >
                    {displayName}
                  </Text>
                </View>

                <ApiaryHeaderImage
                  imageUrl={apiary.imageUrl}
                />
              </View>

              <View
                className="
                  mt-3
                  flex-row
                  flex-wrap
                  gap-2
                "
              >
                {typeLabel && (
                  <View
                    className="
                      rounded-full
                      bg-primary/10
                      px-3
                      py-1.5
                    "
                  >
                    <Text
                      className="
                        text-xs
                        font-bold
                        text-primary
                      "
                    >
                      {typeLabel}
                    </Text>
                  </View>
                )}

                {apiary
                  .identificationNumber && (
                    <View
                      className="
                      rounded-full
                      border
                      border-border
                      bg-surface
                      px-3
                      py-1.5
                    "
                    >
                      <Text
                        className="
                        text-xs
                        font-semibold
                        text-muted
                      "
                      >
                        {
                          apiary
                            .identificationNumber
                        }
                      </Text>
                    </View>
                  )}
              </View>

              <View
                className="
                  mb-4
                  mt-8
                  flex-row
                  items-end
                  justify-between
                "
              >
                <View>
                  <Text
                    className="
                      text-xl
                      font-bold
                      text-foreground
                    "
                  >
                    Košnice
                  </Text>

                  <Text
                    className="
                      mt-1
                      text-sm
                      text-muted
                    "
                  >
                    {hives.length === 0
                      ? 'Nema košnica'
                      : filteredHives.length === hives.length &&
                          hives.length === 1
                        ? '1 košnica'
                        : filteredHives.length === hives.length
                          ? `${hives.length} košnica`
                          : `${filteredHives.length} od ${hives.length} košnica`}
                  </Text>
                </View>
              </View>

              <HiveListFilters
                labelSearch={labelSearch}
                onLabelSearchChange={setLabelSearch}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                selectedColor={selectedColor}
                onColorChange={setSelectedColor}
                availableColors={availableColors}
                hasColorlessHives={hives.some(
                  (hive) => hive.colorHex === null,
                )}
              />
            </View>
          }
          ListEmptyComponent={
            <View
              className="
                rounded-3xl
                border
                border-border
                bg-surface
                px-6
                py-8
              "
            >
              <Text
                className="
                  text-center
                  text-base
                  font-semibold
                  text-foreground
                "
              >
                {hives.length === 0
                  ? 'Pčelinjak još nema košnica.'
                  : 'Nema košnica za izabrane filtere.'}
              </Text>

              <Text
                className="
                  mt-2
                  text-center
                  text-sm
                  text-muted
                "
              >
                {hives.length === 0
                  ? 'Dodajte prvu košnicu iz menija Više.'
                  : 'Promenite filtere da biste videli druge košnice.'}
              </Text>
            </View>
          }
          renderItem={({
            item,
          }) => (
            <HiveCard
              label={
                item.label
              }
              identificationNumber={
                item
                  .identificationNumber
              }
              type={
                item.type
              }
              colorHex={
                item.colorHex
              }
              status={
                item.status
              }
              onPress={() => {
                router.push({
                  pathname:
                    '/hives/[hiveId]',

                  params: {
                    hiveId:
                      item.id,
                  },
                });
              }}
            />
          )}
          ListFooterComponent={
            <CurrentStaySection
              currentStay={currentStayQuery.data}
              isLoading={
                currentStayQuery.isLoading ||
                locationQuery.isLoading
              }
              hasError={
                currentStayQuery.isError ||
                locationQuery.isError
              }
              location={locationQuery.data}
            />
          }
        />
      </Screen>

      <ActionOverflowSheet
        visible={isApiaryActionsOpen}
        onClose={() => {
          setIsApiaryActionsOpen(false);
        }}
        title="Akcije nad pčelinjakom"
        actions={[
          {
            key: 'varroa-treatment',
            label: 'Tretman protiv varoe',
            icon: 'bug-outline',
            accessibilityLabel: 'Evidentiraj tretman protiv varoe',
            onPress: () => {
              router.push({
                pathname: '/apiaries/[apiaryId]/varroa-treatments/create',
                params: { apiaryId },
              } as never);
            },
          },
        ]}
      />

      <ActionOverflowSheet
        visible={
          isMoreOpen
        }
        onClose={() => {
          setIsMoreOpen(
            false,
          );
        }}
        title="Pčelinjak"
        actions={[
          {
            key: 'add-hive',

            label: 'Dodaj košnicu',

            icon: 'add-circle-outline',

            accessibilityLabel: 'Dodaj košnicu u pčelinjak',

            onPress: handleAddHive,
          },

          {
            key: 'stay-history',

            label: 'Boravci',

            icon:
              'time-outline',

            accessibilityLabel:
              'Prikaži istoriju boravaka pčelinjaka',

            onPress:
              handleStayHistoryPress,
          },

          {
            key: 'edit',

            label: 'Izmeni',

            icon:
              'create-outline',

            accessibilityLabel:
              'Izmeni podatke o pčelinjaku',

            onPress:
              handleEditPress,
          },

          {
            key: 'deactivate',

            label: 'Deaktiviraj',

            icon:
              'power-outline',

            accessibilityLabel:
              'Trajno deaktiviraj pčelinjak',

            variant:
              'danger',

            onPress:
              handleDeactivatePress,

            disabled:
              deactivateApiaryMutation.isPending,

            loading:
              deactivateApiaryMutation.isPending,
          },
        ]}
      />
    </>
  );
}

type LoadErrorProps = {
  message: string;
  onRetry: () => void;
};

const orientationLabels: Record<
  HiveEntranceOrientation,
  string
> = {
  north: 'Sever',
  northEast: 'Severoistok',
  east: 'Istok',
  southEast: 'Jugoistok',
  south: 'Jug',
  southWest: 'Jugozapad',
  west: 'Zapad',
  northWest: 'Severozapad',
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('sr-Latn-RS', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function CurrentStaySection({
  currentStay,
  location,
  isLoading,
  hasError,
}: {
  currentStay: CurrentApiaryStay | undefined;
  location: ApiaryLocation | undefined;
  isLoading: boolean;
  hasError: boolean;
}) {
  if (isLoading) {
    return (
      <View className="mt-8 items-center rounded-3xl border border-border bg-surface px-5 py-6">
        <ActivityIndicator color={colors.primary} />
        <Text className="mt-3 text-sm text-muted">
          Učitavanje trenutnog boravka...
        </Text>
      </View>
    );
  }

  if (hasError || !currentStay || !location) {
    return (
      <View className="mt-8 rounded-3xl border border-border bg-surface px-5 py-5">
        <Text className="text-xl font-bold text-foreground">
          Trenutni boravak
        </Text>
        <Text className="mt-2 text-sm text-muted">
          Trenutni boravak ili njegova lokacija nisu evidentirani.
        </Text>
      </View>
    );
  }

  const locationName =
    location.name?.trim() ||
    'Lokacija bez naziva';

  return (
    <View className="mt-8 overflow-hidden rounded-3xl border border-border bg-surface">
      <View className="px-5 pb-5 pt-5">
        <Text className="text-xl font-bold text-foreground">
          Trenutni boravak
        </Text>
        <Text className="mt-1 text-sm text-muted">
          Trenutna lokacija pčelinjaka
        </Text>

        <View className="mt-4 flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <Ionicons
              name="location-outline"
              size={22}
              color={colors.primary}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">
              {locationName}
            </Text>
            {location.altitudeMeters !== null && (
              <Text className="mt-0.5 text-sm text-muted">
                {location.altitudeMeters} m n/v
              </Text>
            )}
          </View>
        </View>

        <View className="mt-4 gap-3 rounded-2xl bg-background px-4 py-4">
          <StayDetail
            icon="calendar-outline"
            label="Početak boravka"
            value={formatDateTime(currentStay.startedAtUtc)}
          />
          <StayDetail
            icon="compass-outline"
            label="Orijentacija ulaza"
            value={currentStay.orientation
              ? orientationLabels[currentStay.orientation]
              : 'Nije evidentirana'}
          />
          {location.cadastralParcelNumber && (
            <StayDetail
              icon="map-outline"
              label="Katastarska parcela"
              value={location.cadastralParcelNumber}
            />
          )}
          {currentStay.note && (
            <StayDetail
              icon="chatbox-outline"
              label="Beleška"
              value={currentStay.note}
            />
          )}
        </View>

        {location.description && (
          <Text className="mt-4 text-sm leading-5 text-muted">
            {location.description}
          </Text>
        )}
      </View>

      <View className="border-t border-border">
        <LocationMap
          value={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          onLocationPress={() => undefined}
        />
      </View>
    </View>
  );
}

function StayDetail({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <Ionicons name={icon} size={17} color={colors.muted} />
      <Text className="w-28 text-sm text-muted">
        {label}
      </Text>
      <Text className="flex-1 text-sm font-semibold text-foreground">
        {value}
      </Text>
    </View>
  );
}

function LoadError({
  message,
  onRetry,
}: LoadErrorProps) {
  return (
    <View
      className="
        flex-1
        items-center
        justify-center
        px-8
      "
    >
      <Text
        className="
          text-center
          text-base
          font-semibold
          text-error
        "
      >
        {message}
      </Text>

      <Pressable
        onPress={onRetry}
        className="
          mt-5
          rounded-2xl
          bg-primary
          px-5
          py-3
        "
      >
        <Text
          className="
            font-bold
            text-background
          "
        >
          Pokušaj ponovo
        </Text>
      </Pressable>
    </View>
  );
}
