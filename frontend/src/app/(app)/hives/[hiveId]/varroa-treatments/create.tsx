import { useLocalSearchParams } from 'expo-router';

import { RecordVarroaTreatmentScreen } from '@/features/varroa-treatments/screens/record-varroa-treatment-screen';

export default function RecordHiveVarroaTreatmentRoute() {
  const { hiveId } = useLocalSearchParams<{ hiveId: string }>();

  return <RecordVarroaTreatmentScreen hiveId={hiveId} />;
}
