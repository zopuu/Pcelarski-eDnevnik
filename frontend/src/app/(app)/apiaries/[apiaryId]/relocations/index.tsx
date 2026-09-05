import {
  useLocalSearchParams,
} from 'expo-router';

import {
  RelocationHistoryScreen,
} from '@/features/relocations/screens/relocation-history-screen';

export default function RelocationHistoryRoute() {
  const {
    apiaryId,
  } = useLocalSearchParams<{
    apiaryId: string;
  }>();

  return (
    <RelocationHistoryScreen
      apiaryId={apiaryId}
    />
  );
}
