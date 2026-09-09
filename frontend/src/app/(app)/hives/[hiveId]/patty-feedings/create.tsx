import { useLocalSearchParams } from 'expo-router';

import { RecordPattyFeedingScreen } from '@/features/patty-feedings/screens/record-patty-feeding-screen';

export default function RecordHivePattyFeedingRoute() {
  const { hiveId } = useLocalSearchParams<{ hiveId: string }>();

  return <RecordPattyFeedingScreen hiveId={hiveId} />;
}
