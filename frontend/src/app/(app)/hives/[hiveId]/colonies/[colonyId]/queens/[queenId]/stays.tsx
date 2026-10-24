import { useLocalSearchParams } from 'expo-router';

import { QueenStayHistoryScreen } from '@/features/queens/screens/queen-stay-history-screen';

export default function QueenStayHistoryRoute() {
  const { hiveId, colonyId, queenId } = useLocalSearchParams<{
    hiveId: string;
    colonyId: string;
    queenId: string;
  }>();

  return <QueenStayHistoryScreen hiveId={hiveId} colonyId={colonyId} queenId={queenId} />;
}
