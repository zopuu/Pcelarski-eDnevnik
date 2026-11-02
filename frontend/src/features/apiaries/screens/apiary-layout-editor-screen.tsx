import { router, useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApiaryLayout } from '@/features/apiaries/hooks/use-apiary-layout';
import { useApiaryLayoutEditor } from '@/features/apiaries/layout/hooks/use-apiary-layout-editor';
import { ApiaryMap } from '@/features/apiaries/layout/components/apiary-map';
import { UnplacedHiveTray } from '@/features/apiaries/layout/components/unplaced-hive-tray';
import type { ApiaryLayoutResponse } from '@/features/apiaries/types/apiary-layout';
import { ApiError } from '@/shared/api/api-error';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { colors } from '@/shared/theme/colors';

type Props = { apiaryId: string };

export function ApiaryLayoutEditorScreen({ apiaryId }: Props) {
  const { openDrawer } = useAppDrawer();
  const layoutQuery = useApiaryLayout(apiaryId);
  const noActiveStay =
    layoutQuery.error instanceof ApiError &&
    layoutQuery.error.problem?.code === 'apiaries.layout_no_active_stay';

  return (
    <Screen header={<AppHeader onMenuPress={openDrawer} />}>
      {noActiveStay && !layoutQuery.data ? (
        <EditorUnavailable message="Pčelinjak nema aktivan boravak. Raspored trenutno nije dostupan." />
      ) : layoutQuery.isPending && layoutQuery.fetchStatus !== 'paused' ? (
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-3 text-muted">Učitavanje rasporeda košnica...</Text>
        </View>
      ) : !layoutQuery.data ? (
        <EditorUnavailable
          message={
            layoutQuery.fetchStatus === 'paused'
              ? 'Nema mrežne veze. Raspored trenutno nije dostupan.'
              : 'Nije moguće učitati raspored košnica.'
          }
          onRetry={() => void layoutQuery.refetch()}
        />
      ) : (
        <LoadedEditor
          layout={layoutQuery.data}
          noActiveStay={noActiveStay}
          refreshError={layoutQuery.isError}
          onRetry={() => void layoutQuery.refetch()}
        />
      )}
    </Screen>
  );
}

function EditorUnavailable({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-center text-base font-semibold text-foreground">{message}</Text>
      {onRetry && (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          className="mt-4 min-h-12 justify-center rounded-2xl bg-primary px-5 active:opacity-80"
        >
          <Text className="font-bold text-background">Pokušaj ponovo</Text>
        </Pressable>
      )}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        className="mt-3 min-h-12 justify-center px-5 active:opacity-80"
      >
        <Text className="font-semibold text-primary">Nazad na pčelinjak</Text>
      </Pressable>
    </View>
  );
}

function LoadedEditor({
  layout,
  noActiveStay,
  refreshError,
  onRetry,
}: {
  layout: ApiaryLayoutResponse;
  noActiveStay: boolean;
  refreshError: boolean;
  onRetry: () => void;
}) {
  const editor = useApiaryLayoutEditor(layout);
  const navigation = useNavigation();
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const parentScrollGesture = useMemo(() => Gesture.Native(), []);
  const [allowLeave, setAllowLeave] = useState(false);
  const pendingNavigation = useRef<(() => void) | null>(null);
  const staleLayout =
    layout.apiaryStayId !== editor.apiaryStayId || layout.version !== editor.version;
  const mapHeight = Math.max(
    180,
    Math.min(windowHeight * 0.6, windowHeight - insets.top - insets.bottom - 64 - 84 - 100 - 128),
  );

  usePreventRemove(editor.isDirty && !allowLeave, ({ data }) => {
    const discard = () => {
      pendingNavigation.current = () => navigation.dispatch(data.action);
      setAllowLeave(true);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Nesačuvane izmene će biti odbačene. Želite li da nastavite?')) {
        discard();
      }
      return;
    }

    Alert.alert('Nesačuvane izmene', 'Izmene rasporeda neće biti sačuvane.', [
      { text: 'Nastavi uređivanje', style: 'cancel' },
      { text: 'Odbaci izmene', style: 'destructive', onPress: discard },
    ]);
  });

  useEffect(() => {
    if (!allowLeave) return;
    pendingNavigation.current?.();
    pendingNavigation.current = null;
  }, [allowLeave]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !editor.isDirty) return;
    const preventUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', preventUnload);
    return () => window.removeEventListener('beforeunload', preventUnload);
  }, [editor.isDirty]);

  return (
    <View className="flex-1">
      <GestureDetector gesture={parentScrollGesture}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 }}
        >
          <Text className="text-2xl font-bold text-foreground">Uredi raspored</Text>
          <Text className="mt-1 text-sm text-muted">
            Postavljeno: {editor.placedHives.length} · Nepostavljeno: {editor.unplacedHives.length}{' '}
            · Ukupno: {editor.totalHiveCount}
          </Text>

          {staleLayout && (
            <View className="mt-3 rounded-2xl border border-warning bg-surface px-4 py-3">
              <Text className="text-sm text-foreground">
                Raspored je promenjen tokom uređivanja. Vaše izmene su zadržane u ovom prikazu.
              </Text>
            </View>
          )}
          {noActiveStay && (
            <View className="mt-3 rounded-2xl border border-warning bg-surface px-4 py-3">
              <Text className="text-sm text-foreground">
                Pčelinjak više nema aktivan boravak. Prikazan je raspored sa početka uređivanja.
              </Text>
            </View>
          )}
          {refreshError && !noActiveStay && (
            <View className="mt-3 rounded-2xl border border-border bg-surface px-4 py-3">
              <Text className="text-sm text-muted">Osvežavanje rasporeda nije uspelo.</Text>
              <Pressable
                accessibilityRole="button"
                onPress={onRetry}
                className="mt-1 self-start py-2"
              >
                <Text className="font-semibold text-primary">Pokušaj ponovo</Text>
              </Pressable>
            </View>
          )}

          <View className="mt-4 overflow-hidden rounded-3xl">
            <ApiaryMap
              hives={editor.placedHives}
              parentScrollGesture={parentScrollGesture}
              style={{
                height: mapHeight,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 24,
                backgroundColor: colors.surfaceWarm,
              }}
            />
            {editor.totalHiveCount === 0 && (
              <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
                <Text className="text-center text-sm text-muted">Pčelinjak još nema košnica.</Text>
              </View>
            )}
            {editor.totalHiveCount > 0 && editor.placedHives.length === 0 && (
              <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
                <Text className="text-center text-sm text-muted">
                  Košnice još nisu postavljene na raspored.
                </Text>
              </View>
            )}
          </View>
          <View className="mt-3">
            <UnplacedHiveTray hives={editor.unplacedHives} showWhenEmpty />
          </View>
        </ScrollView>
      </GestureDetector>

      <View
        className="flex-row gap-3 border-t border-border bg-background px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="min-h-12 flex-1 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-80"
        >
          <Text className="font-bold text-foreground">Otkaži</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          disabled
          className="min-h-12 flex-1 items-center justify-center rounded-2xl bg-primary opacity-50"
        >
          <Text className="font-bold text-background">Sačuvaj</Text>
        </Pressable>
      </View>
    </View>
  );
}
