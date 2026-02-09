import { generateOAuthUrl } from "@/lib/oauth";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ConnectButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    setIsLoading(true);
    const state = Math.random().toString(36).substring(7);
    const oauthUrl = generateOAuthUrl(state);

    if (typeof window !== "undefined") {
      sessionStorage.setItem("oauth_state", state);
    }

    window.location.href = oauthUrl;
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      className="bg-[#635BFF] hover:bg-[#4F46E5] text-white"
      size="lg"
    >
      {isLoading ? "Connecting..." : "Connect with Stripe"}
    </Button>
  );
}
