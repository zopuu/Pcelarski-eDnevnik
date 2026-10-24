import { useLocalSearchParams } from 'expo-router';

import { TransferColonyScreen } from '@/features/colonies/screens/transfer-colony-screen';

export default function TransferColonyRoute() {
  const { hiveId, colonyId } = useLocalSearchParams<{
    hiveId: string;
    colonyId: string;
  }>();

  return <TransferColonyScreen hiveId={hiveId} colonyId={colonyId} />;
}
