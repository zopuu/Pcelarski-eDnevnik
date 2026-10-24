import { useLocalSearchParams } from 'expo-router';

import { QueenDetailsScreen } from '@/features/queens/screens/queen-details-screen';

export default function QueenDetailsRoute() {
  const { hiveId, colonyId, queenId } = useLocalSearchParams<{
    hiveId: string;
    colonyId: string;
    queenId: string;
  }>();

  return <QueenDetailsScreen hiveId={hiveId} colonyId={colonyId} queenId={queenId} />;
}
