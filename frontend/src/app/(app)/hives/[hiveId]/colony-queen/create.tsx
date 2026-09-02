import {
  useLocalSearchParams,
} from 'expo-router';

import {
  CreateColonyWithQueenScreen,
} from '@/features/hives/screens/create-colony-with-queen-screen';

export default function CreateColonyWithQueenRoute() {
  const {
    hiveId,
  } =
    useLocalSearchParams<{
      hiveId: string;
    }>();

  return (
    <CreateColonyWithQueenScreen
      hiveId={hiveId}
    />
  );
}