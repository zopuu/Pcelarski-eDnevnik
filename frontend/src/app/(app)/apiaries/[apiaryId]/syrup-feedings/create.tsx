import { useLocalSearchParams } from 'expo-router';

import { RecordSyrupFeedingScreen } from '@/features/syrup-feedings/screens/record-syrup-feeding-screen';

export default function RecordApiarySyrupFeedingRoute() {
  const { apiaryId } = useLocalSearchParams<{ apiaryId: string }>();

  return <RecordSyrupFeedingScreen apiaryId={apiaryId} />;
}
