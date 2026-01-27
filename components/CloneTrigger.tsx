import { getConnectedAccountIdClient } from "@/lib/storage";
import { useState } from "react";

export default function CloneTrigger() {
  const [customerId, setCustomerId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);

    const connectedAccountId = getConnectedAccountIdClient();

    if (!connectedAccountId) {
      setError("No connected account found. Please connect first.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/clone/payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectedAccountId,
          customerId,
          paymentMethodId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to clone payment method");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Clone Payment Method</h2>
      <p className="text-sm text-gray-600 mb-4">
        Clone a payment method from your platform account to the connected account
      </p>

      <form onSubmit={handleClone} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platform Customer ID
          </label>
          <input
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="cus_xxxxxxxxxxxxx"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Customer ID from your platform account
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platform Payment Method ID
          </label>
          <input
            type="text"
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="pm_xxxxxxxxxxxxx"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Payment method ID from your platform account
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#635BFF] text-white py-2 px-4 rounded-md hover:bg-[#4F46E5] disabled:opacity-50"
        >
          {isLoading ? "Cloning..." : "Clone Payment Method"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-semibold">
            Payment method cloned successfully!
          </p>
          <p className="text-sm text-gray-700 mt-2">
            Cloned Payment Method ID: <code className="bg-gray-100 px-2 py-1 rounded">{result.id}</code>
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-gray-600">
              View full response
            </summary>
            <pre className="mt-2 text-xs text-gray-700 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
