import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { SideDrawer } from '@/shared/components/navigation/side-drawer';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useMyProfile } from '@/features/beekeeper-profile/hooks/use-my-profile';

type AppDrawerContextValue = {
  openDrawer: () => void;
  closeDrawer: () => void;
};

const AppDrawerContext = createContext<AppDrawerContextValue | undefined>(undefined);

export function AppDrawerProvider({ children }: PropsWithChildren) {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: isProfileLoading } = useMyProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const openDrawer = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      openDrawer,
      closeDrawer,
    }),
    [openDrawer, closeDrawer],
  );
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    /*
     * Close the drawer before the
     * browser-based OIDC logout flow opens.
     */
    setIsOpen(false);

    try {
      await signOut();
    } finally {
      queryClient.clear();
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, queryClient, signOut]);

  const handleProfilePress = useCallback(() => {
    setIsOpen(false);
    router.push('/profile' as never);
  }, []);

  const profileName = profile ? `${profile.firstName} ${profile.lastName}` : undefined;

  return (
    <AppDrawerContext.Provider value={value}>
      {children}

      <SideDrawer
        visible={isOpen}
        onClose={closeDrawer}
        onProfilePress={handleProfilePress}
        profileName={profileName}
        isProfileLoading={isProfileLoading}
        onLogout={() => {
          void handleLogout();
        }}
        isLoggingOut={isLoggingOut}
      />
    </AppDrawerContext.Provider>
  );
}

export function useAppDrawer() {
  const context = useContext(AppDrawerContext);

  if (!context) {
    throw new Error('useAppDrawer must be used inside AppDrawerProvider.');
  }

  return context;
}
