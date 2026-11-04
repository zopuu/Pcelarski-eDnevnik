import { useCallback, useMemo, useState } from 'react';

import type {
  ApiaryLayoutHive,
  ApiaryLayoutPosition,
  ApiaryLayoutResponse,
} from '../../types/apiary-layout';
import type { PlacedApiaryLayoutHive, UnplacedApiaryLayoutHive } from '../apiary-layout-selectors';

type EditorSnapshot = {
  apiaryStayId: string;
  version: number;
  hives: readonly Readonly<ApiaryLayoutHive>[];
  originalPositions: readonly Readonly<ApiaryLayoutPosition>[];
};

function positionsFromHives(hives: readonly ApiaryLayoutHive[]): ApiaryLayoutPosition[] {
  return hives.flatMap((hive) =>
    hive.x !== null && hive.y !== null ? [{ hiveId: hive.id, x: hive.x, y: hive.y }] : [],
  );
}

function positionsEqual(
  original: readonly Readonly<ApiaryLayoutPosition>[],
  working: readonly Readonly<ApiaryLayoutPosition>[],
): boolean {
  if (original.length !== working.length) return false;

  const originalById = new Map(original.map((position) => [position.hiveId, position]));
  return working.every((position) => {
    const saved = originalById.get(position.hiveId);
    return saved?.x === position.x && saved.y === position.y;
  });
}

function validCoordinate(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0 && value <= 2_147_483_647;
}

/** A single editing session keeps its first server snapshot even when the query refetches. */
export function useApiaryLayoutEditor(layout: ApiaryLayoutResponse) {
  const [snapshot, setSnapshot] = useState<EditorSnapshot>(() => ({
    apiaryStayId: layout.apiaryStayId,
    version: layout.version,
    hives: layout.hives.map((hive) => ({ ...hive })),
    originalPositions: positionsFromHives(layout.hives),
  }));
  const [workingPositions, setWorkingPositions] = useState<readonly ApiaryLayoutPosition[]>(() =>
    snapshot.originalPositions.map((position) => ({ ...position })),
  );

  const activeHiveIds = useMemo(() => new Set(snapshot.hives.map((hive) => hive.id)), [snapshot]);

  const placeHive = useCallback(
    (hiveId: string, x: number, y: number) => {
      if (!activeHiveIds.has(hiveId) || !validCoordinate(x) || !validCoordinate(y)) return;
      setWorkingPositions((current) =>
        current.some((position) => position.hiveId === hiveId)
          ? current
          : [...current, { hiveId, x, y }],
      );
    },
    [activeHiveIds],
  );

  const moveHive = useCallback(
    (hiveId: string, x: number, y: number) => {
      if (!activeHiveIds.has(hiveId) || !validCoordinate(x) || !validCoordinate(y)) return;
      setWorkingPositions((current) => {
        if (!current.some((position) => position.hiveId === hiveId)) return current;
        return current.map((position) =>
          position.hiveId === hiveId && (position.x !== x || position.y !== y)
            ? { hiveId, x, y }
            : position,
        );
      });
    },
    [activeHiveIds],
  );

  const removeHive = useCallback((hiveId: string) => {
    setWorkingPositions((current) => current.filter((position) => position.hiveId !== hiveId));
  }, []);

  const resetPositions = useCallback(() => {
    setWorkingPositions(snapshot.originalPositions.map((position) => ({ ...position })));
  }, [snapshot]);

  const reloadLayout = useCallback((latest: ApiaryLayoutResponse) => {
    const nextSnapshot: EditorSnapshot = {
      apiaryStayId: latest.apiaryStayId,
      version: latest.version,
      hives: latest.hives.map((hive) => ({ ...hive })),
      originalPositions: positionsFromHives(latest.hives),
    };
    setSnapshot(nextSnapshot);
    setWorkingPositions(nextSnapshot.originalPositions.map((position) => ({ ...position })));
  }, []);

  const { placedHives, unplacedHives } = useMemo(() => {
    const positionsById = new Map(workingPositions.map((position) => [position.hiveId, position]));
    const placed: PlacedApiaryLayoutHive[] = [];
    const unplaced: UnplacedApiaryLayoutHive[] = [];

    for (const hive of snapshot.hives) {
      const position = positionsById.get(hive.id);
      if (position) {
        placed.push({ ...hive, x: position.x, y: position.y });
      } else {
        unplaced.push({ ...hive, x: null, y: null });
      }
    }

    return { placedHives: placed, unplacedHives: unplaced };
  }, [snapshot, workingPositions]);

  return {
    apiaryStayId: snapshot.apiaryStayId,
    version: snapshot.version,
    originalPositions: snapshot.originalPositions,
    workingPositions,
    isDirty: !positionsEqual(snapshot.originalPositions, workingPositions),
    placedHives,
    unplacedHives,
    totalHiveCount: snapshot.hives.length,
    placeHive,
    moveHive,
    removeHive,
    resetPositions,
    reloadLayout,
  };
}
