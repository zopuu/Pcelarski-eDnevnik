import { useLocalSearchParams } from 'expo-router';

import { SyrupFeedingDetailsScreen } from '@/features/syrup-feedings/screens/syrup-feeding-details-screen';

export default function SyrupFeedingDetailsRoute() {
  const { hiveId, feedingId } = useLocalSearchParams<{
    hiveId: string;
    feedingId: string;
  }>();

  return <SyrupFeedingDetailsScreen hiveId={hiveId} feedingId={feedingId} />;
}
