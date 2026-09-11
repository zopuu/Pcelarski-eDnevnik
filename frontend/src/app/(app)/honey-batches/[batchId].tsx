import { useLocalSearchParams } from 'expo-router';
import { HoneyBatchDetailsScreen } from '@/features/harvests/screens/honey-batch-details-screen';

export default function HoneyBatchDetailsRoute() {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  return <HoneyBatchDetailsScreen batchId={batchId} />;
}
