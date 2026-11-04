/* Reanimated animated refs and styles are passed to views, not read during render. */
/* eslint-disable react-hooks/refs */
/* Reanimated shared values are intentionally changed at save/reload boundaries. */
/* eslint-disable react-hooks/immutability */
import { router, useNavigation } from 'expo-router';
import Ionicons from '@react-native-vector-icons/ionicons';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
  StyleSheet,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApiaryLayout } from '@/features/apiaries/hooks/use-apiary-layout';
import { useReplaceApiaryLayout } from '@/features/apiaries/hooks/use-replace-apiary-layout';
import { useApiaryLayoutEditor } from '@/features/apiaries/layout/hooks/use-apiary-layout-editor';
import { getApiaryLayoutCollisionViolations } from '@/features/apiaries/layout/apiary-layout-errors';
import { ApiaryMap } from '@/features/apiaries/layout/components/apiary-map';
import { AlignmentGuides } from '@/features/apiaries/layout/components/alignment-guides';
import { UnplacedHiveTray } from '@/features/apiaries/layout/components/unplaced-hive-tray';
import { HiveMapMarker } from '@/features/apiaries/layout/components/hive-map-marker';
import { useHiveLayoutDrag } from '@/features/apiaries/layout/hooks/use-hive-layout-drag';
import { resolveHiveFootprint } from '@/features/apiaries/layout/geometry/hive-footprints';
import { canPlaceHive } from '@/features/apiaries/layout/geometry/placement';
import type { ApiaryLayoutResponse } from '@/features/apiaries/types/apiary-layout';
import { ApiError, MissingAccessTokenError } from '@/shared/api/api-error';
import { AppHeader } from '@/shared/components/navigation/app-header';
import { Screen } from '@/shared/components/screen/screen';
import { useAppDrawer } from '@/providers/app-drawer-provider';
import { colors } from '@/shared/theme/colors';

type Props = { apiaryId: string };

function saveErrorMessage(error: unknown): string {
  if (error instanceof MissingAccessTokenError) {
    return 'Prijavite se ponovo da biste sačuvali raspored.';
  }
  if (error instanceof ApiError) {
    switch (error.problem?.code) {
      case 'apiaries.layout_collision':
        return 'Neke košnice se preklapaju ili su preblizu. Pomerite označene košnice.';
      case 'apiaries.layout_invalid_position':
        return 'Neka pozicija košnice nije ispravna. Proverite raspored i pokušajte ponovo.';
      case 'apiaries.layout_duplicate_hive':
        return 'Ista košnica je više puta navedena u rasporedu. Proverite raspored.';
      case 'apiaries.layout_hive_not_in_apiary':
        return 'Sastav košnica u pčelinjaku se promenio. Učitajte najnoviji raspored.';
      case 'apiaries.layout_read_only':
      case 'apiaries.layout_no_active_stay':
        return 'Ovaj boravak više nije aktivan i raspored ne može da se sačuva.';
      case 'apiaries.layout_version_conflict':
        return 'Raspored ili sastav košnica se promenio tokom uređivanja. Učitajte najnoviji raspored.';
    }
    if (error.status === 409) {
      return 'Raspored ili sastav košnica se promenio. Učitajte najnoviji raspored.';
    }
    return 'Raspored nije sačuvan. Vaše izmene su zadržane. Pokušajte ponovo.';
  }
  return 'Čuvanje nije potvrđeno. Vaše izmene su zadržane. Proverite vezu pre ponovnog pokušaja.';
}

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
          apiaryId={apiaryId}
          layout={layoutQuery.data}
          noActiveStay={noActiveStay}
          refreshError={layoutQuery.isError}
          onRetry={() => void layoutQuery.refetch()}
          onReload={async () => {
            const result = await layoutQuery.refetch();
            return result.isSuccess ? result.data : null;
          }}
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
  apiaryId,
  layout,
  noActiveStay,
  refreshError,
  onRetry,
  onReload,
}: {
  apiaryId: string;
  layout: ApiaryLayoutResponse;
  noActiveStay: boolean;
  refreshError: boolean;
  onRetry: () => void;
  onReload: () => Promise<ApiaryLayoutResponse | null>;
}) {
  const editor = useApiaryLayoutEditor(layout);
  const replaceMutation = useReplaceApiaryLayout();
  const [saveError, setSaveError] = useState<unknown>(null);
  const [conflictCode, setConflictCode] = useState<string | null>(null);
  const [reloadError, setReloadError] = useState(false);
  const [reloadInProgress, setReloadInProgress] = useState(false);
  const saveInProgress = useRef(false);
  const editingBlocked = useSharedValue(false);
  const previousPositions = useRef(editor.workingPositions);
  const cameraX = useSharedValue(0);
  const cameraY = useSharedValue(0);
  const cameraZoom = useSharedValue(1);
  const camera = useMemo(
    () => ({ x: cameraX, y: cameraY, zoom: cameraZoom }),
    [cameraX, cameraY, cameraZoom],
  );
  const operations = useMemo(
    () => ({
      placeHive: editor.placeHive,
      moveHive: editor.moveHive,
      removeHive: editor.removeHive,
    }),
    [editor.placeHive, editor.moveHive, editor.removeHive],
  );
  const drag = useHiveLayoutDrag(editor.placedHives, operations, camera, editingBlocked);
  const [selectedHiveId, setSelectedHiveId] = useState<string | null>(null);
  const selectedHive = editor.placedHives.find((hive) => hive.id === selectedHiveId);
  const selectHive = useCallback((id: string) => setSelectedHiveId(id), []);
  const navigation = useNavigation();
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const parentScrollRef = useRef<ScrollView>(null);
  const [allowLeave, setAllowLeave] = useState(false);
  const pendingNavigation = useRef<(() => void) | null>(null);
  const isSaving = replaceMutation.isPending || saveInProgress.current;
  const isBusy = isSaving || reloadInProgress;
  const readOnly =
    noActiveStay ||
    conflictCode === 'apiaries.layout_read_only' ||
    conflictCode === 'apiaries.layout_no_active_stay';
  const validLayout = useMemo(
    () =>
      editor.placedHives.every((hive) => canPlaceHive(hive, hive.x, hive.y, editor.placedHives)),
    [editor.placedHives],
  );
  const canSave =
    editor.isDirty && validLayout && !isBusy && !drag.session && !readOnly && !conflictCode;
  const collisionViolations = getApiaryLayoutCollisionViolations(saveError);
  const highlightedHiveIds = useMemo(() => {
    if (!collisionViolations) return undefined;
    return new Set(
      collisionViolations.flatMap((violation) => [violation.hiveId, violation.conflictingHiveId]),
    );
  }, [collisionViolations]);
  const staleLayout =
    layout.apiaryStayId !== editor.apiaryStayId || layout.version !== editor.version;
  const mapHeight = Math.max(
    180,
    Math.min(windowHeight * 0.6, windowHeight - insets.top - insets.bottom - 64 - 84 - 100 - 128),
  );
  const mapStyle = useMemo(
    () => ({
      height: mapHeight - 2,
    }),
    [mapHeight],
  );

  usePreventRemove((editor.isDirty || isBusy) && !allowLeave, ({ data }) => {
    if (saveInProgress.current || reloadInProgress) return;
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
    if (previousPositions.current === editor.workingPositions) return;
    previousPositions.current = editor.workingPositions;
    setSaveError(null);
  }, [editor.workingPositions]);

  useEffect(() => {
    if (Platform.OS !== 'web' || (!editor.isDirty && !isBusy)) return;
    const preventUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', preventUnload);
    return () => window.removeEventListener('beforeunload', preventUnload);
  }, [editor.isDirty, isBusy]);

  const handleSave = async () => {
    if (!canSave || saveInProgress.current || drag.locked.value) return;
    saveInProgress.current = true;
    editingBlocked.value = true;
    setSaveError(null);
    setReloadError(false);
    try {
      await replaceMutation.mutateAsync({
        apiaryId,
        request: {
          expectedApiaryStayId: editor.apiaryStayId,
          expectedVersion: editor.version,
          positions: editor.workingPositions.map(({ hiveId, x, y }) => ({ hiveId, x, y })),
        },
      });
      pendingNavigation.current = () => router.back();
      setAllowLeave(true);
    } catch (error) {
      setSaveError(error);
      if (error instanceof ApiError && error.status === 409) {
        setConflictCode(typeof error.problem?.code === 'string' ? error.problem.code : 'conflict');
      }
      saveInProgress.current = false;
      editingBlocked.value = false;
    }
  };

  const reloadLatest = async () => {
    if (isBusy || drag.session || drag.locked.value) return;
    setReloadInProgress(true);
    editingBlocked.value = true;
    setReloadError(false);
    try {
      const latest = await onReload();
      if (!latest) {
        setReloadError(true);
        return;
      }
      editor.reloadLayout(latest);
      setSelectedHiveId(null);
      setSaveError(null);
      setConflictCode(null);
    } catch {
      setReloadError(true);
    } finally {
      setReloadInProgress(false);
      editingBlocked.value = false;
    }
  };

  const confirmReload = () => {
    const message = 'Najnoviji raspored će zameniti vaše nesačuvane izmene u ovom prikazu.';
    if (Platform.OS === 'web') {
      if (window.confirm(message)) void reloadLatest();
      return;
    }
    Alert.alert('Učitaj najnoviji raspored', message, [
      { text: 'Nastavi uređivanje', style: 'cancel' },
      { text: 'Odbaci izmene i učitaj', style: 'destructive', onPress: () => void reloadLatest() },
    ]);
  };

  const dragSession = drag.session;

  return (
    <Animated.View ref={drag.rootRef} collapsable={false} className="flex-1">
      <ScrollView
        ref={parentScrollRef}
        scrollEnabled={!drag.session}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 }}
      >
        <Text className="text-2xl font-bold text-foreground">Uredi raspored</Text>
        <Text className="mt-1 text-sm text-muted">
          Postavljeno: {editor.placedHives.length} · Nepostavljeno: {editor.unplacedHives.length} ·
          Ukupno: {editor.totalHiveCount}
        </Text>
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Magnetno poravnanje"
          accessibilityState={{ checked: drag.magneticEnabled }}
          onPress={() => drag.setMagneticEnabled(!drag.magneticEnabled)}
          className="mt-2 min-h-11 flex-row items-center self-start rounded-xl border border-border bg-surface px-3 active:opacity-80"
        >
          <Ionicons
            name="magnet-outline"
            size={18}
            color={drag.magneticEnabled ? colors.primary : colors.muted}
          />
          <Text className="ml-2 text-sm font-semibold text-foreground">
            Magnetno poravnanje: {drag.magneticEnabled ? 'uključeno' : 'isključeno'}
          </Text>
        </Pressable>

        {staleLayout && (
          <View className="mt-3 rounded-2xl border border-warning bg-surface px-4 py-3">
            <Text className="text-sm text-foreground">
              Raspored je promenjen tokom uređivanja. Vaše izmene su zadržane u ovom prikazu.
            </Text>
          </View>
        )}
        {conflictCode && (
          <View className="mt-3 rounded-2xl border border-warning bg-surface px-4 py-3">
            <Text className="text-sm text-foreground">
              {saveError
                ? saveErrorMessage(saveError)
                : 'Raspored se promenio. Učitajte najnoviji raspored.'}
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={isBusy || Boolean(drag.session)}
              onPress={confirmReload}
              className="mt-2 min-h-11 self-start justify-center active:opacity-80"
            >
              <Text className="font-semibold text-primary">
                {reloadInProgress ? 'Učitavanje...' : 'Učitaj najnoviji raspored'}
              </Text>
            </Pressable>
            {reloadError && (
              <Text className="mt-1 text-sm text-error">
                Najnoviji raspored nije učitan. Vaše izmene su zadržane.
              </Text>
            )}
          </View>
        )}
        {saveError !== null && !conflictCode && (
          <View className="mt-3 rounded-2xl border border-error bg-surface px-4 py-3">
            <Text className="text-sm text-error">{saveErrorMessage(saveError)}</Text>
          </View>
        )}
        {editor.isDirty && !validLayout && (
          <View className="mt-3 rounded-2xl border border-error bg-surface px-4 py-3">
            <Text className="text-sm text-error">
              Neke košnice se preklapaju ili su preblizu. Pomerite ih pre čuvanja.
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

        <View
          className="mt-4 overflow-hidden rounded-3xl"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceWarm,
          }}
        >
          <ApiaryMap
            hives={editor.placedHives}
            highlightedHiveIds={highlightedHiveIds}
            overlay={<AlignmentGuides alignment={drag.alignment} camera={camera} />}
            extendPositiveCanvas
            parentScrollGesture={parentScrollRef}
            cameraValues={camera}
            interactionLocked={drag.locked}
            viewportRef={drag.mapRef}
            dragHandlers={isBusy ? undefined : drag.handlers}
            activeDragHiveId={drag.activeHiveId}
            onMarkerReady={drag.markMarkerReady}
            onHivePress={selectHive}
            style={mapStyle}
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
        {selectedHive && (
          <Pressable
            accessibilityRole="button"
            disabled={isBusy || Boolean(drag.session)}
            onPress={() => {
              editor.removeHive(selectedHive.id);
              setSelectedHiveId(null);
            }}
            className="mt-2 min-h-12 self-start justify-center rounded-xl border border-border bg-surface px-4 active:opacity-80"
          >
            <Text className="font-semibold text-foreground">
              Ukloni sa rasporeda · {selectedHive.label}
            </Text>
          </Pressable>
        )}
        <View className="mt-3">
          <UnplacedHiveTray
            hives={editor.unplacedHives}
            showWhenEmpty
            dragHandlers={isBusy ? undefined : drag.handlers}
            activeDragHiveId={drag.activeHiveId}
            trayRef={drag.trayRef}
          />
        </View>
      </ScrollView>

      <View
        className="flex-row gap-3 border-t border-border bg-background px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isBusy }}
          disabled={isBusy}
          onPress={() => router.back()}
          className={`min-h-12 flex-1 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-80 ${isBusy ? 'opacity-50' : ''}`}
        >
          <Text className="font-bold text-foreground">Otkaži</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave, busy: isSaving }}
          disabled={!canSave}
          onPress={() => void handleSave()}
          className={`min-h-12 flex-1 flex-row items-center justify-center rounded-2xl bg-primary active:opacity-80 ${!canSave ? 'opacity-50' : ''}`}
        >
          {isSaving && <ActivityIndicator size="small" color={colors.onPrimary} className="mr-2" />}
          <Text className="font-bold text-background">{isSaving ? 'Čuvanje...' : 'Sačuvaj'}</Text>
        </Pressable>
      </View>
      {dragSession && (
        <View pointerEvents="none" style={styles.dragOverlay}>
          <Animated.View
            style={[
              styles.dragPreview,
              {
                width: resolveHiveFootprint(dragSession.hive.hiveType).width,
                height: resolveHiveFootprint(dragSession.hive.hiveType).height,
              },
              drag.previewStyle,
            ]}
          >
            <HiveMapMarker
              hive={dragSession.hive}
              footprint={resolveHiveFootprint(dragSession.hive.hiveType)}
              onArtworkDisplay={() =>
                drag.markPreviewReady(dragSession.hive.id, dragSession.generation)
              }
            />
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dragOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
    overflow: 'visible',
  },
  dragPreview: {
    position: 'absolute',
    borderRadius: 8,
    transformOrigin: [0, 0, 0],
  },
});
