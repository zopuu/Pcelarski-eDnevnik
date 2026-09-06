import { useLocalSearchParams } from 'expo-router';

import { HiveRelocationHistoryScreen } from '@/features/relocations/screens/hive-relocation-history-screen';

export default function HiveRelocationHistoryRoute() {
  const { hiveId } = useLocalSearchParams<{ hiveId: string }>();
  return <HiveRelocationHistoryScreen hiveId={hiveId} />;
}
