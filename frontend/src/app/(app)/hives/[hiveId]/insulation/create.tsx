import { useLocalSearchParams } from 'expo-router';

import { RecordHiveInsulationScreen } from '@/features/hive-insulation/screens/record-hive-insulation-screen';

export default function RecordHiveInsulationRoute() {
  const { hiveId } = useLocalSearchParams<{ hiveId: string }>();

  return <RecordHiveInsulationScreen hiveId={hiveId} />;
}
