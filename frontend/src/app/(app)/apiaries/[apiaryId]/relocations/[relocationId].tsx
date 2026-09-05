import {
  useLocalSearchParams,
} from 'expo-router';

import {
  RelocationDetailsScreen,
} from '@/features/relocations/screens/relocation-details-screen';

export default function RelocationDetailsRoute() {
  const { relocationId } = useLocalSearchParams<{ relocationId: string }>();

  return <RelocationDetailsScreen relocationId={relocationId} />;
}
