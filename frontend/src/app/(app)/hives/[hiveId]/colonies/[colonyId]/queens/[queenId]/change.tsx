import { useLocalSearchParams } from 'expo-router';

import { ChangeQueenScreen } from '@/features/queens/screens/change-queen-screen';

export default function ChangeQueenRoute() {
  const { hiveId, colonyId, queenId } = useLocalSearchParams<{
    hiveId: string;
    colonyId: string;
    queenId: string;
  }>();
  return <ChangeQueenScreen hiveId={hiveId} colonyId={colonyId} queenId={queenId} />;
}
