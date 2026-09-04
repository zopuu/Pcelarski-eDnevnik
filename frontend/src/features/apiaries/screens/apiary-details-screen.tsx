import {
  router,
} from 'expo-router';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Alert,
  Text,
  View,
} from 'react-native';
import { useState } from 'react';
import {
  useApiary,
} from '@/features/apiaries/hooks/use-apiary';

import {
  HiveCard,
} from '@/features/hives/components/hive-card';

import {
  useHives,
} from '@/features/hives/hooks/use-hives';

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

  const handleRelocationsPress =
    () => {
      Alert.alert(
        'Istorija selidbi',
        'Istorija selidbi biće povezana kada implementiramo odgovarajući ekran.',
      );
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

  const handleDeletePress = () => {
    Alert.alert(
      'Obriši pčelinjak',
      'Da li sigurno želite da obrišete ovaj pčelinjak?',
      [
        {
          text: 'Otkaži',
          style: 'cancel',
        },
        {
          text: 'Obriši',
          style:
            'destructive',

          onPress: () => {
            Alert.alert(
              'Brisanje',
              'Backend brisanje ćemo povezati kada implementiramo Delete funkcionalnost.',
            );
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
                'add-hive',

              label:
                'Košnica',

              icon: 'add',

              accessibilityLabel:
                'Dodaj košnicu',

              onPress:
                handleAddHive,
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
          data={hives}
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
                numberOfLines={2}
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
                    {hives.length ===
                      0
                      ? 'Nema košnica'
                      : hives.length ===
                        1
                        ? '1 košnica'
                        : `${hives.length} košnica`}
                  </Text>
                </View>
              </View>
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
                Pčelinjak još nema
                košnica.
              </Text>

              <Text
                className="
                  mt-2
                  text-center
                  text-sm
                  text-muted
                "
              >
                Dodajte prvu košnicu
                pomoću centralnog
                dugmeta Košnica.
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
        />
      </Screen>

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
            key: 'delete',

            label: 'Obriši',

            icon:
              'trash-outline',

            accessibilityLabel:
              'Obriši pčelinjak',

            variant:
              'danger',

            onPress:
              handleDeletePress,
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
