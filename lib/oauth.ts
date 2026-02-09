import { config, getRedirectUri } from "./config";
import type { OAuthTokenResponse } from "./types";

export function generateOAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.stripe.partnerClientId,
    scope: "read_write",
    redirect_uri: getRedirectUri(),
  });

  if (state) {
    params.append("state", state);
  }

  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string
): Promise<OAuthTokenResponse> {
  const response = await fetch("https://connect.stripe.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${config.stripe.partnerSecretKey}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || "Failed to exchange code for token");
  }

  return response.json();
}

export async function deauthorizeAccount(
  stripe_user_id: string
): Promise<{ stripe_user_id: string }> {
  const response = await fetch("https://connect.stripe.com/oauth/deauthorize", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${config.stripe.partnerSecretKey}`,
    },
    body: new URLSearchParams({
      client_id: config.stripe.partnerClientId,
      stripe_user_id,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || "Failed to deauthorize account");
  }

  return response.json();
}
