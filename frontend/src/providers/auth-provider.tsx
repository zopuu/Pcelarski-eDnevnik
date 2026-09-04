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
import type { AccessTokenRequestOptions } from '@/shared/api/api-client';
import { environment } from '@/shared/config/environment';
import type { AuthSession as StoredAuthSession } from '@/features/auth/types/auth-session';

const ACCESS_TOKEN_REFRESH_SKEW_MS =
    60_000;
const SESSION_REFRESH_TIMEOUT_MS =
    15_000;

class SessionRefreshTimeoutError extends Error {
    constructor() {
        super(
            'Refreshing the session timed out.',
        );

        this.name =
            'SessionRefreshTimeoutError';
    }
}

function withSessionRefreshTimeout<T>(
    operation: Promise<T>,
): Promise<T> {
    return new Promise<T>(
        (resolve, reject) => {
            const timeoutId = setTimeout(
                () => {
                    reject(
                        new SessionRefreshTimeoutError(),
                    );
                },
                SESSION_REFRESH_TIMEOUT_MS,
            );

            operation.then(
                (value) => {
                    clearTimeout(timeoutId);
                    resolve(value);
                },
                (cause: unknown) => {
                    clearTimeout(timeoutId);
                    reject(cause);
                },
            );
        },
    );
}

const redirectUri =
    AuthSession.makeRedirectUri({
        scheme: 'pcelarskiednevnik',
        path: 'auth/callback',
    });
const logoutRedirectUri =
    AuthSession.makeRedirectUri({
        scheme: 'pcelarskiednevnik',
        path: 'auth/logout-callback',
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
                'offline_access',
                environment.oidcApiScope,
            ],
            prompt: AuthSession.Prompt.Login,

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

    const [
        isRefreshingSession,
        setIsRefreshingSession,
    ] = useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const exchangedCodeRef =
        useRef<string | null>(null);
    const sessionRef =
        useRef<StoredAuthSession | null>(
            null,
        );

    const refreshPromiseRef =
        useRef<
            Promise<StoredAuthSession | null>
            | null
        >(null);

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

            if (!stored?.refreshToken) {
                await clearAuthSession();

                sessionRef.current = null;

                setStatus('unauthenticated');
                return;
            }

            sessionRef.current = stored;

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


                if (!tokenResponse.refreshToken) {
                    throw new Error(
                        'Authorization server nije vratio refresh token.',
                    );
                }

                const expiresAt =
                    tokenResponse.expiresIn
                        ? Date.now() +
                        tokenResponse.expiresIn *
                        1000
                        : undefined;

                const session = {
                    accessToken:
                        tokenResponse.accessToken,

                    refreshToken:
                        tokenResponse.refreshToken,

                    idToken:
                        tokenResponse.idToken,

                    expiresAt,
                };
                sessionRef.current = session;

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
    const refreshSession =
        useCallback(
            async (): Promise<
                StoredAuthSession | null
            > => {
                if (refreshPromiseRef.current) {
                    return refreshPromiseRef.current;
                }

                const currentSession =
                    sessionRef.current;

                if (!currentSession?.refreshToken) {
                    return null;
                }

                const refreshPromise =
                    (async () => {
                        setIsRefreshingSession(true);

                        try {
                            const refreshDiscovery =
                                discovery?.tokenEndpoint
                                    ? discovery
                                    : await withSessionRefreshTimeout(
                                        AuthSession
                                            .fetchDiscoveryAsync(
                                                environment.apiUrl,
                                            ),
                                    );

                            if (
                                !refreshDiscovery
                                    .tokenEndpoint
                            ) {
                                throw new Error(
                                    'Authorization server does not provide a token endpoint.',
                                );
                            }

                            const tokenResponse =
                                await withSessionRefreshTimeout(
                                    AuthSession.refreshAsync(
                                        {
                                            clientId:
                                                environment
                                                    .oidcClientId,

                                            refreshToken:
                                                currentSession
                                                    .refreshToken,
                                        },
                                        refreshDiscovery,
                                    ),
                                );

                            if (
                                sessionRef.current !==
                                currentSession
                            ) {
                                return null;
                            }

                            const expiresAt =
                                tokenResponse.expiresIn
                                    ? Date.now() +
                                    tokenResponse.expiresIn *
                                    1000
                                    : undefined;

                            const refreshedSession:
                                StoredAuthSession = {
                                accessToken:
                                    tokenResponse
                                        .accessToken,

                                refreshToken:
                                    tokenResponse
                                        .refreshToken ??
                                    currentSession
                                        .refreshToken,

                                idToken:
                                    tokenResponse
                                        .idToken ??
                                    currentSession.idToken,

                                expiresAt,
                            };

                            sessionRef.current =
                                refreshedSession;

                            await saveAuthSession(
                                refreshedSession,
                            );

                            setAccessToken(
                                refreshedSession
                                    .accessToken,
                            );

                            return refreshedSession;
                        } catch (cause) {
                            console.warn(
                                'Token refresh failed.',
                                cause,
                            );

                            return null;
                        } finally {
                            setIsRefreshingSession(false);
                        }
                    })();

                refreshPromiseRef.current =
                    refreshPromise;

                try {
                    return await refreshPromise;
                } finally {
                    if (
                        refreshPromiseRef.current ===
                        refreshPromise
                    ) {
                        refreshPromiseRef.current =
                            null;
                    }
                }
            },
            [discovery],
        );
    const getValidAccessToken =
        useCallback(
            async (
                options:
                    AccessTokenRequestOptions = {},
            ): Promise<string | null> => {
                const session =
                    sessionRef.current;

                if (!session) {
                    return null;
                }

                // Another API request may already
                // have refreshed this token.
                if (
                    options.forceRefresh &&
                    options.staleAccessToken &&
                    session.accessToken !==
                    options.staleAccessToken
                ) {
                    return session.accessToken;
                }

                const tokenIsFresh =
                    !session.expiresAt ||
                    session.expiresAt -
                    Date.now() >
                    ACCESS_TOKEN_REFRESH_SKEW_MS;

                if (
                    !options.forceRefresh &&
                    tokenIsFresh
                ) {
                    return session.accessToken;
                }

                const refreshedSession =
                    await refreshSession();

                return (
                    refreshedSession?.accessToken ??
                    null
                );
            },
            [refreshSession],
        );
    useEffect(() => {
        setApiAccessTokenProvider(
            getValidAccessToken,
        );

        return () => {
            setApiAccessTokenProvider(
                async () => null,
            );
        };
    }, [getValidAccessToken]);

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
            setError(null);

            try {
                const session =
                    await loadAuthSession();

                if (
                    discovery?.endSessionEndpoint &&
                    session
                ) {
                    const logoutUrl =
                        new URL(
                            discovery.endSessionEndpoint,
                        );

                    logoutUrl.searchParams.set(
                        'client_id',
                        environment.oidcClientId,
                    );

                    logoutUrl.searchParams.set(
                        'post_logout_redirect_uri',
                        logoutRedirectUri,
                    );

                    if (session.idToken) {
                        logoutUrl.searchParams.set(
                            'id_token_hint',
                            session.idToken,
                        );
                    }

                    await WebBrowser.openAuthSessionAsync(
                        logoutUrl.toString(),
                        logoutRedirectUri,
                    );
                }
            } catch (cause) {
                console.warn(
                    'Server logout failed.',
                    cause,
                );
            } finally {
                await clearAuthSession();

                setAccessToken(null);

                sessionRef.current = null;

                setStatus('unauthenticated');
            }
        }, [
            discovery,
        ]);

    return (
        <AuthContext.Provider
            value={{
                status,
                isAuthenticated:
                    status === 'authenticated',
                isSigningIn,
                isRefreshingSession,
                error,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
