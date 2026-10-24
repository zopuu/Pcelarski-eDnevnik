import { ActivityIndicator, Alert, FlatList, Text, View } from 'react-native';
import { useMemo, useState } from 'react';

import { ApiaryCard } from '@/features/apiaries/components/apiary-card';
import { ApiaryListFilters } from '@/features/apiaries/components/apiary-list-filters';

import { useApiaries } from '@/features/apiaries/hooks/use-apiaries';
import type { ApiaryStatus, ApiaryType } from '@/features/apiaries/types/apiary';

import { useMyProfile } from '@/features/beekeeper-profile/hooks/use-my-profile';

import { useAppDrawer } from '@/providers/app-drawer-provider';

import { AppHeader } from '@/shared/components/navigation/app-header';

import { ContextualActionBar } from '@/shared/components/contextual-action-bar/contextual-action-bar';

import { colors } from '@/shared/theme/colors';

import { router } from 'expo-router';
import { Screen } from '@/shared/components/screen/screen';

export function HomeScreen() {
  const { openDrawer } = useAppDrawer();

  const {
    data: apiaries = [],
    isLoading: areApiariesLoading,
    isError: areApiariesError,
  } = useApiaries();
  const [nameSearch, setNameSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ApiaryStatus | null>('active');
  const [selectedType, setSelectedType] = useState<ApiaryType | null>(null);

  const { data: profile, isLoading: isProfileLoading } = useMyProfile();

  const greeting = isProfileLoading
    ? 'Dobro došli'
    : profile?.firstName
      ? `Dobro došli, ${profile.firstName}`
      : 'Dobro došli';

  const filteredApiaries = useMemo(() => {
    const normalizedSearch = nameSearch.trim().toLocaleLowerCase();

    return apiaries.filter((apiary) => {
      const matchesName =
        !normalizedSearch || apiary.name?.toLocaleLowerCase().includes(normalizedSearch);
      const matchesStatus = !selectedStatus || apiary.status === selectedStatus;
      const matchesType = !selectedType || apiary.type === selectedType;

      return matchesName && matchesStatus && matchesType;
    });
  }, [apiaries, nameSearch, selectedStatus, selectedType]);

  const showComingSoon = (feature: string) => {
    Alert.alert(feature, 'Ova funkcionalnost će biti dodata u narednom koraku razvoja.');
  };

  return (
    <Screen
      header={<AppHeader onMenuPress={openDrawer} />}
      contextualActionBar={
        <ContextualActionBar
          leftActions={[
            {
              key: 'honey',
              label: 'Med',
              icon: 'water-outline',
              accessibilityLabel: 'Otvori vrcanja i serije meda',
              onPress: () => {
                router.push('/harvests' as never);
              },
            },

            {
              key: 'forage-observation',
              label: 'Zapažanje',
              icon: 'leaf-outline',
              accessibilityLabel: 'Otvori zapažanja paše',
              onPress: () => {
                router.push('/forage-observations' as never);
              },
            },
          ]}
          primaryAction={{
            key: 'create-apiary',
            label: 'Pčelinjak',
            icon: 'add',
            accessibilityLabel: 'Dodaj pčelinjak',
            onPress: () => {
              router.push('/apiaries/create');
            },
          }}
          rightActions={[
            {
              key: 'scan',
              label: 'Skeniraj',
              icon: 'scan-outline',
              accessibilityLabel: 'Skeniraj QR ili bar kod',
              onPress: () => {
                showComingSoon('Skeniranje');
              },
            },

            {
              key: 'more',
              label: 'Više',
              icon: 'ellipsis-horizontal',
              accessibilityLabel: 'Prikaži više akcija',
              onPress: () => {
                showComingSoon('Više akcija');
              },
            },
          ]}
        />
      }
    >
      {/* loading / error / FlatList */}

      {areApiariesLoading ? (
        <View
          className="
            flex-1
            items-center
            justify-center
          "
        >
          <ActivityIndicator size="large" color={colors.primary} />

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
            Nije moguće učitati pčelinjake.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredApiaries}
          keyExtractor={(apiary) => apiary.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,

            paddingTop: 20,
          }}
          ItemSeparatorComponent={() => <View className="h-4" />}
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
                  : filteredApiaries.length === apiaries.length
                    ? apiaries.length === 1
                      ? '1 pčelinjak'
                      : `${apiaries.length} pčelinjaka`
                    : `${filteredApiaries.length} od ${apiaries.length} pčelinjaka`}
              </Text>

              {apiaries.length > 0 && (
                <View className="mt-5">
                  <ApiaryListFilters
                    nameSearch={nameSearch}
                    onNameSearchChange={setNameSearch}
                    selectedStatus={selectedStatus}
                    onStatusChange={setSelectedStatus}
                    selectedType={selectedType}
                    onTypeChange={setSelectedType}
                  />
                </View>
              )}
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
                {apiaries.length === 0
                  ? 'Još nemate evidentiranih pčelinjaka. Dodajte prvi pomoću centralnog dugmeta Pčelinjak.'
                  : 'Nema pčelinjaka za izabrane filtere. Promenite filtere da biste videli druge pčelinjake.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ApiaryCard
              name={item.name}
              imageUrl={item.imageUrl}
              isInactive={item.status === 'inactive'}
              onPress={() => {
                router.push({
                  pathname: '/apiaries/[apiaryId]',

                  params: {
                    apiaryId: item.id,
                  },
                });
              }}
            />
          )}
        />
      )}
    </Screen>
  );
}
