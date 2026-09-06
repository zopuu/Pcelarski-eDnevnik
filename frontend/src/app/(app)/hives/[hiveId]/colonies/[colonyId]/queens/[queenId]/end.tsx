import {
  useLocalSearchParams,
} from 'expo-router';

import {
  EndQueenStayScreen,
} from '@/features/queens/screens/end-queen-stay-screen';

export default function EndQueenStayRoute() {
  const {
    hiveId,
    colonyId,
    queenId,
  } = useLocalSearchParams<{
    hiveId: string;
    colonyId: string;
    queenId: string;
  }>();

  return (
    <EndQueenStayScreen
      hiveId={hiveId}
      colonyId={colonyId}
      queenId={queenId}
    />
  );
}
