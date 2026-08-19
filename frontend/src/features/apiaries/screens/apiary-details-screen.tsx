import {
  router,
} from 'expo-router';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  useApiary,
} from '@/features/apiaries/hooks/use-apiary';

import {
  AddHiveCard,
} from '@/features/hives/components/add-hive-card';

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
  AppHeader,
} from '@/shared/components/navigation/app-header';

import {
  colors,
} from '@/shared/theme/colors';

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
    data: apiary,
    isLoading:
      isApiaryLoading,
    isError:
      isApiaryError,
  } =
    useApiary(
      apiaryId,
    );

  const {
    data: hives = [],
    isLoading:
      areHivesLoading,
    isError:
      areHivesError,
  } =
    useHives(
      apiaryId,
    );

  if (
    isApiaryLoading ||
    areHivesLoading
  ) {
    return (
      <View className="flex-1 bg-background">
        <AppHeader
          onMenuPress={
            openDrawer
          }
        />

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
            Učitavanje košnica...
          </Text>
        </View>
      </View>
    );
  }

  if (
    isApiaryError ||
    areHivesError ||
    !apiary
  ) {
    return (
      <View className="flex-1 bg-background">
        <AppHeader
          onMenuPress={
            openDrawer
          }
        />

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
            podatke o pčelinjaku.
          </Text>
        </View>
      </View>
    );
  }

  const displayName =
    apiary.name?.trim() ||
    'Pčelinjak bez naziva';

  const typeLabel =
    getApiaryTypeLabel(
      apiary.type,
    );

  return (
    <View className="flex-1 bg-background">
      <AppHeader
        onMenuPress={
          openDrawer
        }
      />

      <FlatList
        data={hives}
        keyExtractor={(
          hive,
        ) => hive.id}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
        ItemSeparatorComponent={() => (
          <View className="h-3" />
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
                    {
                      typeLabel
                    }
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
              da biste počeli sa
              evidencijom.
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
            status={
              item.status
            }
            onPress={() => {
              /*
               * Hive details
               * comes later.
               */
            }}
          />
        )}
        ListFooterComponent={
          <View className="mt-4">
            <AddHiveCard
              onPress={() => {
                router.push({
                  pathname:
                    '/apiaries/[apiaryId]/hives/create',

                  params: {
                    apiaryId,
                  },
                });
              }}
            />
          </View>
        }
      />
    </View>
  );
}