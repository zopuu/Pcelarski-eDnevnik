import { Platform } from 'react-native';

function normalizeBaseUrl(
    value: string,
): string {
    return value.replace(/\/+$/, '');
}

function requireEnvironmentVariable(
    value: string | undefined,
    name: string,
): string {
    if (!value?.trim()) {
        throw new Error(
            `Missing required environment variable: ${name}`,
        );
    }

    return value.trim();
}

const isWeb =
    Platform.OS === 'web';

const apiUrl =
    requireEnvironmentVariable(
        isWeb
            ? process.env.EXPO_PUBLIC_WEB_API_URL
            : process.env.EXPO_PUBLIC_NATIVE_API_URL,

        isWeb
            ? 'EXPO_PUBLIC_WEB_API_URL'
            : 'EXPO_PUBLIC_NATIVE_API_URL',
    );

const oidcClientId =
    requireEnvironmentVariable(
        isWeb
            ? process.env.EXPO_PUBLIC_OIDC_WEB_CLIENT_ID
            : process.env.EXPO_PUBLIC_OIDC_NATIVE_CLIENT_ID,

        isWeb
            ? 'EXPO_PUBLIC_OIDC_WEB_CLIENT_ID'
            : 'EXPO_PUBLIC_OIDC_NATIVE_CLIENT_ID',
    );

const oidcApiScope =
    requireEnvironmentVariable(
        process.env.EXPO_PUBLIC_OIDC_API_SCOPE,
        'EXPO_PUBLIC_OIDC_API_SCOPE',
    );

export const environment =
    Object.freeze({
        apiUrl:
            normalizeBaseUrl(apiUrl),

        oidcClientId,

        oidcApiScope,
    });