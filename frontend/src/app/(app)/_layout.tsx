import { Stack } from 'expo-router';

import { AppDrawerProvider } from '@/providers/app-drawer-provider';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export default function AppLayout() {
  return (
    <KeyboardProvider>
      <AppDrawerProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </AppDrawerProvider>
    </KeyboardProvider>
  );
}
