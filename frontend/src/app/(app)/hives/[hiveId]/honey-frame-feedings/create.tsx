import { useLocalSearchParams } from 'expo-router';

import { RecordHoneyFrameFeedingScreen } from '@/features/honey-frame-feedings/screens/record-honey-frame-feeding-screen';

export default function RecordHiveHoneyFrameFeedingRoute() {
  const { hiveId } = useLocalSearchParams<{ hiveId: string }>();

  return <RecordHoneyFrameFeedingScreen hiveId={hiveId} />;
}
