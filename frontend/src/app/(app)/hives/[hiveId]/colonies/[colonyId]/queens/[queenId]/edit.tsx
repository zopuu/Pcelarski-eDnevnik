import { useLocalSearchParams } from 'expo-router';

import { EditQueenScreen } from '@/features/queens/screens/edit-queen-screen';

export default function EditQueenRoute() {
  const { hiveId, colonyId, queenId } = useLocalSearchParams<{
    hiveId: string;
    colonyId: string;
    queenId: string;
  }>();

  return <EditQueenScreen hiveId={hiveId} colonyId={colonyId} queenId={queenId} />;
}
