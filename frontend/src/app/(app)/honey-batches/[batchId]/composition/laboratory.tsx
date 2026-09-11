import { useLocalSearchParams } from 'expo-router';
import { HoneyBatchCompositionEditorScreen } from '@/features/harvests/screens/honey-batch-composition-editor-screen';

export default function LaboratoryHoneyBatchCompositionRoute() {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  return <HoneyBatchCompositionEditorScreen batchId={batchId} mode="laboratory" />;
}
