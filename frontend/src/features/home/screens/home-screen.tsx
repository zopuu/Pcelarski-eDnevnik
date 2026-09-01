import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  View,
} from 'react-native';

import {
  ApiaryCard,
} from '@/features/apiaries/components/apiary-card';

import {
  useApiaries,
} from '@/features/apiaries/hooks/use-apiaries';

import {
  useMyProfile,
} from '@/features/beekeeper-profile/hooks/use-my-profile';

import {
  useAppDrawer,
} from '@/providers/app-drawer-provider';

import {
  AppHeader,
} from '@/shared/components/navigation/app-header';

import {
  ContextualActionBar,
} from '@/shared/components/contextual-action-bar/contextual-action-bar';

import {
  useContextualActionBarContentPadding,
} from '@/shared/components/contextual-action-bar/use-contextual-action-bar-content-padding';

import {
  colors,
} from '@/shared/theme/colors';

import {
  router,
} from 'expo-router';

export function HomeScreen() {
  const {
    openDrawer,
  } = useAppDrawer();

  const {
    data: apiaries = [],
    isLoading: areApiariesLoading,
    isError: areApiariesError,
  } = useApiaries();

  const {
    data: profile,
    isLoading:
      isProfileLoading,
  } = useMyProfile();

  const contentBottomPadding =
    useContextualActionBarContentPadding();

  const greeting =
    isProfileLoading
      ? 'Dobro došli'
      : profile?.firstName
        ? `Dobro došli, ${profile.firstName}`
        : 'Dobro došli';

  const showComingSoon = (
    feature: string,
  ) => {
    Alert.alert(
      feature,
      'Ova funkcionalnost će biti dodata u narednom koraku razvoja.',
    );
  };

  return (
    <View
      className="
        flex-1
        bg-background
      "
    >
      <AppHeader
        onMenuPress={
          openDrawer
        }
      />

      <ContextualActionBar
        leftActions={[
          {
            key: 'sales',
            label: 'Prodaja',
            icon: 'cash-outline',

            accessibilityLabel:
              'Otvori prodaju',

            onPress: () => {
              showComingSoon(
                'Prodaja',
              );
            },
          },

          {
            key:
              'forage-observation',

            label:
              'Zapažanje',

            icon:
              'leaf-outline',

            accessibilityLabel:
              'Dodaj zapažanje paše',

            onPress: () => {
              showComingSoon(
                'Zapažanje paše',
              );
            },
          },
        ]}
        primaryAction={{
          key:
            'create-apiary',

          label:
            'Pčelinjak',

          icon:
            'add',

          accessibilityLabel:
            'Dodaj pčelinjak',

          onPress: () => {
            router.push(
              '/apiaries/create',
            );
          },
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

            onPress: () => {
              showComingSoon(
                'Skeniranje',
              );
            },
          },

          {
            key: 'more',

            label:
              'Više',

            icon:
              'ellipsis-horizontal',

            accessibilityLabel:
              'Prikaži više akcija',

            onPress: () => {
              showComingSoon(
                'Više akcija',
              );
            },
          },
        ]}
      />

      {areApiariesLoading ? (
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
            Učitavanje
            pčelinjaka...
          </Text>
        </View>
      ) : areApiariesError ? (
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
            Nije moguće učitati
            pčelinjake.
          </Text>
        </View>
      ) : (
        <FlatList
          data={
            apiaries
          }
          keyExtractor={(
            apiary,
          ) => apiary.id}
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={{
            paddingHorizontal:
              16,

            paddingTop:
              20,

            paddingBottom:
              contentBottomPadding,
          }}
          ItemSeparatorComponent={() => (
            <View
              className="h-4"
            />
          )}
          ListHeaderComponent={
            <View
              className="mb-5"
            >
              <Text
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-foreground
                "
              >
                {greeting}
              </Text>

              <Text
                className="
                  mt-1
                  text-sm
                  text-muted
                "
              >
                {apiaries.length ===
                0
                  ? 'Još nemate pčelinjaka'
                  : apiaries.length ===
                      1
                    ? '1 pčelinjak'
                    : `${apiaries.length} pčelinjaka`}
              </Text>
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
                  text-muted
                "
              >
                Još nemate
                evidentiranih
                pčelinjaka.
                Dodajte prvi
                pomoću centralnog
                dugmeta Pčelinjak.
              </Text>
            </View>
          }
          renderItem={({
            item,
          }) => (
            <ApiaryCard
              name={
                item.name
              }
              onPress={() => {
                router.push({
                  pathname:
                    '/apiaries/[apiaryId]',

                  params: {
                    apiaryId:
                      item.id,
                  },
                });
              }}
            />
          )}
        />
      )}
    </View>
  );
}