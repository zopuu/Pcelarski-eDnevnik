import {
  router,
} from 'expo-router';

import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  useApiary,
} from '@/features/apiaries/hooks/use-apiary';
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
  Screen,
} from '@/shared/components/screen/screen';
import {
  colors,
} from '@/shared/theme/colors';

type RelocationHistoryScreenProps = {
  apiaryId: string;
};

export function RelocationHistoryScreen({
  apiaryId,
}: RelocationHistoryScreenProps) {
  const {
    openDrawer,
  } = useAppDrawer();

  const {
    data: apiary,
    isLoading,
    isError,
    refetch,
  } = useApiary(apiaryId);

  const openCreateRelocation = () => {
    router.push({
      pathname:
        '/apiaries/[apiaryId]/relocations/create',
      params: {
        apiaryId,
      },
    });
  };

  return (
    <Screen
      header={
        <AppHeader
          onMenuPress={openDrawer}
        />
      }
      contextualActionBar={
        <ContextualActionBar
          primaryAction={{
            key: 'create-relocation',
            label: 'Nova selidba',
            icon: 'add',
            accessibilityLabel:
              'Kreiraj novu selidbu pčelinjaka',
            onPress: openCreateRelocation,
          }}
        />
      }
    >
      <View
        className="flex-1 px-4 pt-3"
      >
        <Pressable
          onPress={() => {
            router.back();
          }}
          className="self-start py-2"
        >
          <Text
            className="text-sm font-semibold text-primary"
          >
            ← Pčelinjak
          </Text>
        </Pressable>

        {isLoading ? (
          <View
            className="flex-1 items-center justify-center"
          >
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          </View>
        ) : isError || !apiary ? (
          <View
            className="flex-1 items-center justify-center px-6"
          >
            <Text
              className="text-center text-base font-semibold text-error"
            >
              Nije moguće učitati pčelinjak.
            </Text>

            <Pressable
              onPress={() => {
                void refetch();
              }}
              className="mt-4 rounded-2xl bg-primary px-5 py-3"
            >
              <Text
                className="font-bold text-background"
              >
                Pokušaj ponovo
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <Text
              className="mt-3 text-xs font-bold uppercase tracking-widest text-muted"
            >
              Pčelinjak
            </Text>

            <Text
              className="mt-1 text-3xl font-bold tracking-tight text-foreground"
            >
              {apiary.name?.trim() ||
                'Pčelinjak bez naziva'}
            </Text>

            <Text
              className="mt-8 text-xl font-bold text-foreground"
            >
              Istorija selidbi
            </Text>

            <View
              className="mt-4 rounded-3xl border border-border bg-surface px-6 py-8"
            >
              <Text
                className="text-center text-base font-semibold text-foreground"
              >
                Istorija selidbi uskoro stiže.
              </Text>

              <Text
                className="mt-2 text-center text-sm text-muted"
              >
                Dok je pripremamo, novu selidbu možete evidentirati centralnim dugmetom.
              </Text>
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}
