import {
  FlatList,
  Text,
  View,
} from 'react-native';

import {
  ApiaryCard,
} from '@/features/apiaries/components/apiary-card';

import {
  AddApiaryCard,
} from '@/features/apiaries/components/add-apiary-card';

import {
  useAppDrawer,
} from '@/providers/app-drawer-provider';

import {
  AppHeader,
} from '@/shared/components/navigation/app-header';

type MockApiary = {
  id: string;
  name: string;
};

const mockApiaries: MockApiary[] = [
  {
    id: '1',
    name: 'Pčelinjak 1',
  },
  {
    id: '2',
    name: 'Pčelinjak 2',
  },
  {
    id: '3',
    name: 'Pčelinjak 3',
  },
];

export function HomeScreen() {
  const {
    openDrawer,
  } = useAppDrawer();

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

      <FlatList
        data={
          mockApiaries
        }
        keyExtractor={(
          item,
        ) => item.id}
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
          <View className="mb-4">
            <Text
              className="
                text-2xl
                font-bold
                tracking-tight
                text-foreground
              "
            >
              Moji pčelinjaci
            </Text>

            <Text
              className="
                mt-1
                text-sm
                text-muted
              "
            >
              {
                mockApiaries.length
              } pčelinjaka
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
              console.log(
                'Apiary:',
                item.id,
              );
            }}
          />
        )}
        ListFooterComponent={
          <View className="mt-4">
            <AddApiaryCard
              onPress={() => {
                console.log(
                  'Create apiary',
                );
              }}
            />
          </View>
        }
      />
    </View>
  );
}