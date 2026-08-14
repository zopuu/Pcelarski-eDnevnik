import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import * as Network from 'expo-network';
import {
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import {
  AppState,
  AppStateStatus,
  Platform,
} from 'react-native';

function configureOnlineManager() {
  onlineManager.setEventListener((setOnline) => {
    let initialized = false;

    const subscription = Network.addNetworkStateListener((state) => {
      initialized = true;
      setOnline(Boolean(state.isConnected));
    });

    void Network.getNetworkStateAsync()
      .then((state) => {
        if (!initialized) {
          setOnline(Boolean(state.isConnected));
        }
      })
      .catch(() => {
        // Connectivity will be updated by the subscription
        // when network state becomes available.
      });

    return () => {
      subscription.remove();
    };
  });
}

configureOnlineManager();

export function QueryProvider({
  children,
}: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: 2,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const onAppStateChange = (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    };

    const subscription = AppState.addEventListener(
      'change',
      onAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}