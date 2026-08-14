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

const apiUrl = requireEnvironmentVariable(
  process.env.EXPO_PUBLIC_API_URL,
  'EXPO_PUBLIC_API_URL',
);

const oidcClientId =
  requireEnvironmentVariable(
    process.env.EXPO_PUBLIC_OIDC_CLIENT_ID,
    'EXPO_PUBLIC_OIDC_CLIENT_ID',
  );

const oidcApiScope =
  requireEnvironmentVariable(
    process.env.EXPO_PUBLIC_OIDC_API_SCOPE,
    'EXPO_PUBLIC_OIDC_API_SCOPE',
  );

export const environment =
  Object.freeze({
    apiUrl: normalizeBaseUrl(apiUrl),
    oidcClientId,
    oidcApiScope,
  });