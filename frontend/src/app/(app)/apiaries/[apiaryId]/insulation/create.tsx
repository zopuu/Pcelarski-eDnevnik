import { useLocalSearchParams } from 'expo-router';

import { RecordHiveInsulationScreen } from '@/features/hive-insulation/screens/record-hive-insulation-screen';

export default function RecordApiaryHiveInsulationRoute() {
  const { apiaryId } = useLocalSearchParams<{ apiaryId: string }>();

  return <RecordHiveInsulationScreen apiaryId={apiaryId} />;
}
