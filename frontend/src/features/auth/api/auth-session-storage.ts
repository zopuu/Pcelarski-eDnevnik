import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from '@/shared/storage/secure-storage';

import type {
  AuthSession,
} from '@/features/auth/types/auth-session';

const AUTH_SESSION_KEY =
  'auth.session.v1';

export async function loadAuthSession():
  Promise<AuthSession | null> {
  const value =
    await getSecureItem(AUTH_SESSION_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    await deleteSecureItem(AUTH_SESSION_KEY);

    return null;
  }
}

export async function saveAuthSession(
  session: AuthSession,
): Promise<void> {
  await setSecureItem(
    AUTH_SESSION_KEY,
    JSON.stringify(session),
  );
}

export async function clearAuthSession():
  Promise<void> {
  await deleteSecureItem(AUTH_SESSION_KEY);
}