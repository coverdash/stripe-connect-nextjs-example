import { storeConnectedAccountIdClient } from "@/lib/storage";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function OAuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const { code, state, error, error_description } = router.query;

      // Handle errors from Stripe
      if (error) {
        setStatus("error");
        setErrorMessage(
          (error_description as string) || "Authorization failed"
        );
        return;
      }

      // Verify state (CSRF protection)
      const savedState =
        typeof window !== "undefined"
          ? sessionStorage.getItem("oauth_state")
          : null;
      if (savedState && state !== savedState) {
        setStatus("error");
        setErrorMessage("Invalid state parameter");
        return;
      }

      if (!code) {
        setStatus("error");
        setErrorMessage("No authorization code received");
        return;
      }

      try {
        // Exchange code for token
        const response = await fetch("/api/oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error("Failed to exchange authorization code");
        }

        const data = await response.json();
        
        // Store connected account ID
        storeConnectedAccountIdClient(data.stripe_user_id);
        
        setStatus("success");
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Unknown error occurred"
        );
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635BFF] mx-auto"></div>
            <p className="mt-4 text-gray-600">Connecting your account...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connected Successfully!
            </h2>
            <p className="text-gray-600">Redirecting you back...</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => router.push("/")}
              className="bg-[#635BFF] text-white px-4 py-2 rounded hover:bg-[#4F46E5]"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
