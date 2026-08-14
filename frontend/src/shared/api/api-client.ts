import {
  ApiError,
  MissingAccessTokenError,
  ProblemDetails,
} from '@/shared/api/api-error';
import { environment } from '@/shared/config/environment';

type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE';

type AccessTokenProvider =
  () => string | null;

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  authenticated?: boolean;
}

let accessTokenProvider: AccessTokenProvider =
  () => null;

export function setApiAccessTokenProvider(
  provider: AccessTokenProvider,
): void {
  accessTokenProvider = provider;
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/')
    ? path
    : `/${path}`;

  return `${environment.apiUrl}${normalizedPath}`;
}

function isProblemDetails(
  value: unknown,
): value is ProblemDetails {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Record<string, unknown>;

  return (
    'title' in candidate ||
    'detail' in candidate ||
    'status' in candidate ||
    'errors' in candidate ||
    'traceId' in candidate
  );
}

async function readResponseBody(
  response: Response,
): Promise<unknown> {
  if (
    response.status === 204 ||
    response.status === 205
  ) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  const contentType =
    response.headers.get('content-type') ?? '';

  if (
    contentType.includes('application/json') ||
    contentType.includes(
      'application/problem+json',
    )
  ) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const {
    method = 'GET',
    body,
    authenticated = false,
    signal,
  } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (body !== undefined) {
    headers['Content-Type'] =
      'application/json';
  }

  if (authenticated) {
    const accessToken =
      accessTokenProvider();

    if (!accessToken) {
      throw new MissingAccessTokenError();
    }

    headers.Authorization =
      `Bearer ${accessToken}`;
  }

  const response = await fetch(
    buildUrl(path),
    {
      method,
      headers,
      signal,
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    },
  );

  const payload =
    await readResponseBody(response);

  if (!response.ok) {
    const problem = isProblemDetails(payload)
      ? payload
      : undefined;

    const message =
      problem?.detail ??
      problem?.title ??
      `HTTP request failed with status ${response.status}.`;

    throw new ApiError(
      response.status,
      message,
      problem,
      payload,
    );
  }

  return payload as TResponse;
}
type ReadRequestOptions =
  Omit<
    ApiRequestOptions,
    'method' | 'body'
  >;

type WriteRequestOptions =
  Omit<
    ApiRequestOptions,
    'method' | 'body'
  >;

export const apiClient = {
  get<TResponse>(
    path: string,
    options?: ReadRequestOptions,
  ) {
    return apiRequest<TResponse>(
      path,
      {
        ...options,
        method: 'GET',
      },
    );
  },

  post<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: WriteRequestOptions,
  ) {
    return apiRequest<TResponse>(
      path,
      {
        ...options,
        method: 'POST',
        body,
      },
    );
  },

  put<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: WriteRequestOptions,
  ) {
    return apiRequest<TResponse>(
      path,
      {
        ...options,
        method: 'PUT',
        body,
      },
    );
  },

  patch<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: WriteRequestOptions,
  ) {
    return apiRequest<TResponse>(
      path,
      {
        ...options,
        method: 'PATCH',
        body,
      },
    );
  },

  delete<TResponse>(
    path: string,
    options?: ReadRequestOptions,
  ) {
    return apiRequest<TResponse>(
      path,
      {
        ...options,
        method: 'DELETE',
      },
    );
  },
};