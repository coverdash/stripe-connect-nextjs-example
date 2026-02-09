import { getConnectedAccountIdClient } from "@/lib/storage";
import { useEffect, useState } from "react";

type PaymentFormProps = {
  defaultPaymentMethodId?: string;
  defaultCustomerId?: string;
};

export default function PaymentForm({
  defaultPaymentMethodId,
  defaultCustomerId,
}: PaymentFormProps) {
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (defaultPaymentMethodId) {
      setPaymentMethodId(defaultPaymentMethodId);
    }
  }, [defaultPaymentMethodId]);

  useEffect(() => {
    if (defaultCustomerId) {
      setCustomerId(defaultCustomerId);
    }
  }, [defaultCustomerId]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectedAccountId,
          paymentMethodId,
          customerId,
          amount: parseInt(amount) * 100, // Convert to cents
          currency,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transaction failed");
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
      <h2 className="text-2xl font-bold mb-4">Create Direct Charge</h2>
      <p className="text-sm text-gray-600 mb-4">
        Charges use the connected account customer and attached payment method,
        so Coverdash can reuse them for future renewals or installments without
        requiring the partner to collect payment details again.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method ID
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
            The cloned payment method ID from the connected account
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Connected Account Customer ID
          </label>
          <input
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="cus_xxxxxxxxxxxxx"
          />
          <p className="text-xs text-gray-500 mt-1">
            Customer created during clone step (recommended for reusable charges)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (in dollars)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="10.99"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="usd">USD</option>
            <option value="eur">EUR</option>
            <option value="gbp">GBP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Payment description"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#635BFF] text-white py-2 px-4 rounded-md hover:bg-[#4F46E5] disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Create Charge"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-semibold">Charge successful!</p>
          <pre className="mt-2 text-xs text-gray-700 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
