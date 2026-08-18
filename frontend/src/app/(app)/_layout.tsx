import {
  Stack,
} from 'expo-router';

import {
  AppDrawerProvider,
} from '@/providers/app-drawer-provider';

export default function AppLayout() {
  return (
    <AppDrawerProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AppDrawerProvider>
  );
}