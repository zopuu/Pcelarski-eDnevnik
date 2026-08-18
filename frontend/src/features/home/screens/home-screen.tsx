import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
} from 'react-native';

import {
  AddApiaryCard,
} from '@/features/apiaries/components/add-apiary-card';

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
  colors,
} from '@/shared/theme/colors';

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
    isLoading: isProfileLoading,
  } = useMyProfile();

  const greeting =
    isProfileLoading
      ? 'Dobro došli'
      : profile?.firstName
        ? `Dobro došli, ${profile.firstName}`
        : 'Dobro došli';

  return (
    <View className="flex-1 bg-background">
      <AppHeader
        onMenuPress={
          openDrawer
        }
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
            Učitavanje pčelinjaka...
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
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 40,
          }}
          ItemSeparatorComponent={() => (
            <View className="h-4" />
          )}
          ListHeaderComponent={
            <View className="mb-5">
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
                {apiaries.length === 0
                  ? 'Još nemate pčelinjaka'
                  : apiaries.length === 1
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
                Dodajte prvi pčelinjak
                kako biste počeli sa
                vođenjem evidencije.
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
                /*
                 * Apiary Details route
                 * comes next.
                 */
              }}
            />
          )}
          ListFooterComponent={
            <View className="mt-4">
              <AddApiaryCard
                onPress={() => {
                  /*
                   * Create Apiary route
                   * comes after Details.
                   */
                }}
              />
            </View>
          }
        />
      )}
    </View>
  );
}