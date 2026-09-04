import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
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

import { configureOnlineManager } from '@/providers/query-online-manager';
import {
  MissingAccessTokenError,
} from '@/shared/api/api-error';

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
            retry: (
              failureCount,
              error,
            ) => {
              if (
                error instanceof
                MissingAccessTokenError
              ) {
                return false;
              }

              return failureCount < 2;
            },
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  useEffect(() => {
    const cleanupOnlineManager =
      configureOnlineManager();

    return cleanupOnlineManager;
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const onAppStateChange = (
      status: AppStateStatus,
    ) => {
      focusManager.setFocused(
        status === 'active',
      );
    };

    const subscription =
      AppState.addEventListener(
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
