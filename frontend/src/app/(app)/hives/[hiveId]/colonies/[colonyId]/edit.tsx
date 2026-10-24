import { useLocalSearchParams } from 'expo-router';

import { EditColonyScreen } from '@/features/colonies/screens/edit-colony-screen';

export default function EditColonyRoute() {
  const { hiveId, colonyId } = useLocalSearchParams<{
    hiveId: string;
    colonyId: string;
  }>();

  return <EditColonyScreen hiveId={hiveId} colonyId={colonyId} />;
}
