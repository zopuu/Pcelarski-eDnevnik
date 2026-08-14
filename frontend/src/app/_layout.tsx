import {
  Stack,
} from 'expo-router';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import {
  useAuth,
} from '@/features/auth/hooks/use-auth';
import {
  AuthProvider,
} from '@/providers/auth-provider';
import {
  QueryProvider,
} from '@/providers/query-provider';

function RootNavigator() {
  const {
    status,
    isAuthenticated,
  } = useAuth();

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected
        guard={!isAuthenticated}
      >
        <Stack.Screen
          name="(auth)"
        />
      </Stack.Protected>

      <Stack.Protected
        guard={isAuthenticated}
      >
        <Stack.Screen
          name="(app)"
        />
      </Stack.Protected>

      <Stack.Screen
        name="auth/callback"
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});