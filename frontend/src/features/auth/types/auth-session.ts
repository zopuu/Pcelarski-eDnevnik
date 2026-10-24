export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  expiresAt?: number;
}
