import { useLocalSearchParams } from 'expo-router';

import { HoneyFrameFeedingDetailsScreen } from '@/features/honey-frame-feedings/screens/honey-frame-feeding-details-screen';

export default function HoneyFrameFeedingDetailsRoute() {
  const { hiveId, feedingId } = useLocalSearchParams<{
    hiveId: string;
    feedingId: string;
  }>();

  return <HoneyFrameFeedingDetailsScreen hiveId={hiveId} feedingId={feedingId} />;
}
