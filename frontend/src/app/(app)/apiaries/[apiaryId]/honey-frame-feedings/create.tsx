import { useLocalSearchParams } from 'expo-router';

import { RecordHoneyFrameFeedingScreen } from '@/features/honey-frame-feedings/screens/record-honey-frame-feeding-screen';

export default function RecordApiaryHoneyFrameFeedingRoute() {
  const { apiaryId } = useLocalSearchParams<{ apiaryId: string }>();

  return <RecordHoneyFrameFeedingScreen apiaryId={apiaryId} />;
}
