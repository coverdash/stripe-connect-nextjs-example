export const config = {
  stripe: {
    clientId: process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID || "",
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    environment: process.env.NEXT_PUBLIC_STRIPE_ENVIRONMENT || "test",
  },
  app: {
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || "/oauth-callback",
    baseUrl:
      process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
        : `http://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || "localhost:3000"}`,
  },
};

export function getRedirectUri(): string {
  return `${config.app.baseUrl}${config.app.redirectUri}`;
}
