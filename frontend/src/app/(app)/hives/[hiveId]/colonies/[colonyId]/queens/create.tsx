import {
  useLocalSearchParams,
} from 'expo-router';

import {
  CreateQueenScreen,
} from '@/features/queens/screens/create-queen-screen';

export default function CreateQueenRoute() {
  const {
    hiveId,
    colonyId,
  } = useLocalSearchParams<{
    hiveId: string;
    colonyId: string;
  }>();

  return <CreateQueenScreen hiveId={hiveId} colonyId={colonyId} />;
}
