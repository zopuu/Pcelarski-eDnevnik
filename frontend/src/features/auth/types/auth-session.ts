export interface AuthSession {
  accessToken: string;
  idToken?: string;
  expiresAt?: number;
}