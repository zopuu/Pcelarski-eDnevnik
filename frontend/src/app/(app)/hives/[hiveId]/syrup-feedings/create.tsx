import { useLocalSearchParams } from 'expo-router';

import { RecordSyrupFeedingScreen } from '@/features/syrup-feedings/screens/record-syrup-feeding-screen';

export default function RecordHiveSyrupFeedingRoute() {
  const { hiveId } = useLocalSearchParams<{ hiveId: string }>();

  return <RecordSyrupFeedingScreen hiveId={hiveId} />;
}
