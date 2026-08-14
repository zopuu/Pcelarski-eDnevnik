import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from '@/features/auth/api/auth-session-storage';
import {
  AuthContext,
  AuthStatus,
} from '@/features/auth/hooks/use-auth';
import {
  setApiAccessTokenProvider,
} from '@/shared/api/api-client';
import { environment } from '@/shared/config/environment';

const redirectUri =
  AuthSession.makeRedirectUri({
    scheme: 'pcelarskiednevnik',
    path: 'auth/callback',
  });

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const discovery =
    AuthSession.useAutoDiscovery(
      environment.apiUrl,
    );

  const [
    request,
    response,
    promptAsync,
  ] = AuthSession.useAuthRequest(
    {
      clientId:
        environment.oidcClientId,

      redirectUri,

      responseType:
        AuthSession.ResponseType.Code,

      scopes: [
        'openid',
        'profile',
        'email',
        environment.oidcApiScope,
      ],

      usePKCE: true,
    },
    discovery,
  );

  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [status, setStatus] =
    useState<AuthStatus>('loading');

  const [isSigningIn, setIsSigningIn] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const exchangedCodeRef =
    useRef<string | null>(null);

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const stored =
        await loadAuthSession();

      if (!active) {
        return;
      }

      if (!stored) {
        setStatus('unauthenticated');
        return;
      }

      if (
        stored.expiresAt &&
        stored.expiresAt <= Date.now()
      ) {
        await clearAuthSession();

        setStatus('unauthenticated');
        return;
      }

      setAccessToken(
        stored.accessToken,
      );

      setStatus('authenticated');
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setApiAccessTokenProvider(
      () => accessToken,
    );
  }, [accessToken]);

  useEffect(() => {
    if (
        response?.type !== 'success' ||
        !request ||
        !request.codeVerifier ||
        !discovery
        ) {
        return;
        }

        const code = response.params.code;
        const codeVerifier = request.codeVerifier;
        const currentDiscovery = discovery;

    if (
      !code ||
      exchangedCodeRef.current === code
    ) {
      return;
    }

    exchangedCodeRef.current = code;

    async function exchangeCode() {
      setIsSigningIn(true);
      setError(null);

      try {
        const tokenResponse =
          await AuthSession.exchangeCodeAsync(
            {
              clientId:
                environment.oidcClientId,

              code,

              redirectUri,

              extraParams: {
                code_verifier: codeVerifier,
            },
            },
            currentDiscovery,
          );

        const expiresAt =
          tokenResponse.expiresIn
            ? Date.now() +
              tokenResponse.expiresIn *
                1000
            : undefined;

        const session = {
          accessToken:
            tokenResponse.accessToken,

          idToken:
            tokenResponse.idToken,

          expiresAt,
        };

        await saveAuthSession(session);

        setAccessToken(
          tokenResponse.accessToken,
        );

        setStatus('authenticated');
      } catch (cause) {
        exchangedCodeRef.current = null;

        setStatus('unauthenticated');

        setError(
          cause instanceof Error
            ? cause.message
            : 'Prijavljivanje nije uspelo.',
        );
      } finally {
        setIsSigningIn(false);
      }
    }

    void exchangeCode();
  }, [
    discovery,
    request,
    response,
  ]);

  const signIn =
    useCallback(async () => {
      if (!request || !discovery) {
        setError(
          'Servis za prijavljivanje još nije spreman.',
        );

        return;
      }

      setError(null);
      setIsSigningIn(true);

      try {
        const result =
          await promptAsync();

        if (
          result.type === 'cancel' ||
          result.type === 'dismiss'
        ) {
          setIsSigningIn(false);
        }

        if (result.type === 'error') {
          setError(
            result.error?.description ??
              'Prijavljivanje nije uspelo.',
          );

          setIsSigningIn(false);
        }
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Prijavljivanje nije uspelo.',
        );

        setIsSigningIn(false);
      }
    }, [
      discovery,
      promptAsync,
      request,
    ]);

  const signOut =
    useCallback(async () => {
      await clearAuthSession();

      setAccessToken(null);
      setStatus('unauthenticated');
    }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        isAuthenticated:
          status === 'authenticated',
        isSigningIn,
        error,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}