import { useLocalSearchParams } from 'expo-router';

import { RecordPattyFeedingScreen } from '@/features/patty-feedings/screens/record-patty-feeding-screen';

export default function RecordApiaryPattyFeedingRoute() {
  const { apiaryId } = useLocalSearchParams<{ apiaryId: string }>();

  return <RecordPattyFeedingScreen apiaryId={apiaryId} />;
}
