import { useLocalSearchParams } from 'expo-router';
import { HarvestDetailsScreen } from '@/features/harvests/screens/harvest-details-screen';

export default function HarvestDetailsRoute() {
  const { harvestId } = useLocalSearchParams<{ harvestId: string }>();
  return <HarvestDetailsScreen harvestId={harvestId} />;
}
