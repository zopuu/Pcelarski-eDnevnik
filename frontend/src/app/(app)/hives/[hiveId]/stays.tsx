import { useLocalSearchParams } from 'expo-router';

import { HiveStayHistoryScreen } from '@/features/hives/screens/hive-stay-history-screen';

export default function HiveStayHistoryRoute() {
  const { hiveId } = useLocalSearchParams<{
    hiveId: string;
  }>();

  return <HiveStayHistoryScreen hiveId={hiveId} />;
}
