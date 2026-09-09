import { useLocalSearchParams } from 'expo-router';

import { PattyFeedingDetailsScreen } from '@/features/patty-feedings/screens/patty-feeding-details-screen';

export default function PattyFeedingDetailsRoute() {
  const { hiveId, feedingId } = useLocalSearchParams<{
    hiveId: string;
    feedingId: string;
  }>();

  return <PattyFeedingDetailsScreen hiveId={hiveId} feedingId={feedingId} />;
}
