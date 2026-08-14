export type ValidationErrors =
  Record<string, string[]>;

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;

  traceId?: string;
  errors?: ValidationErrors;

  [key: string]: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly problem?: ProblemDetails;
  readonly payload?: unknown;

  constructor(
    status: number,
    message: string,
    problem?: ProblemDetails,
    payload?: unknown,
  ) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
    this.payload = payload;
  }
}

export class MissingAccessTokenError extends Error {
  constructor() {
    super(
      'An authenticated API request was attempted without an access token.',
    );

    this.name = 'MissingAccessTokenError';
  }
}