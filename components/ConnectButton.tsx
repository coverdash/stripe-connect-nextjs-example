import { generateOAuthUrl } from "@/lib/oauth";
import { useRouter } from "next/router";
import { useState } from "react";

export default function ConnectButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    setIsLoading(true);
    const state = Math.random().toString(36).substring(7);
    const oauthUrl = generateOAuthUrl(state);
    
    // Store state for verification
    if (typeof window !== "undefined") {
      sessionStorage.setItem("oauth_state", state);
    }
    
    window.location.href = oauthUrl;
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="bg-[#635BFF] hover:bg-[#4F46E5] text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Connecting..." : "Connect with Stripe"}
    </button>
  );
}
