import { OAuthTokenResponse } from "./types";

// In-memory storage for demo purposes
// In production, use a secure database
const storage: Map<string, OAuthTokenResponse> = new Map();

export function storeOAuthToken(token: OAuthTokenResponse): void {
  storage.set(token.stripe_user_id, token);
}

export function getOAuthToken(userId: string): OAuthTokenResponse | undefined {
  return storage.get(userId);
}

export function getAllConnectedAccounts(): OAuthTokenResponse[] {
  return Array.from(storage.values());
}

export function removeOAuthToken(userId: string): boolean {
  return storage.delete(userId);
}

// Client-side localStorage helpers
export function storeConnectedAccountIdClient(accountId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("stripe_connected_account_id", accountId);
  }
}

export function getConnectedAccountIdClient(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("stripe_connected_account_id");
  }
  return null;
}

export function removeConnectedAccountIdClient(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("stripe_connected_account_id");
  }
}
