import { getConnectedAccountIdClient } from "@/lib/storage";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PmOnlyPage() {
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(
    null,
  );
  const [partnerCustomerId, setPartnerCustomerId] = useState("");
  const [partnerCustomerPaymentId, setPartnerCustomerPaymentId] = useState("");
  const [clonedPaymentMethodId, setClonedPaymentMethodId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [description, setDescription] = useState("");

  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneResult, setCloneResult] = useState<any>(null);
  const [cloneError, setCloneError] = useState("");

  const [chargeLoading, setChargeLoading] = useState(false);
  const [chargeResult, setChargeResult] = useState<any>(null);
  const [chargeError, setChargeError] = useState("");

  useEffect(() => {
    setConnectedAccountId(getConnectedAccountIdClient());
  }, []);

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloneLoading(true);
    setCloneError("");
    setCloneResult(null);

    if (!connectedAccountId) {
      setCloneError("No connected account found. Please connect first.");
      setCloneLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/pm-only/clone-payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectedAccountId,
          partnerCustomerId,
          partnerCustomerPaymentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to clone payment method");
      }

      setCloneResult(data);
      setClonedPaymentMethodId(data.paymentMethodId ?? "");
    } catch (err) {
      setCloneError(
        err instanceof Error ? err.message : "Unknown error",
      );
    } finally {
      setCloneLoading(false);
    }
  };

  const handleCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargeLoading(true);
    setChargeError("");
    setChargeResult(null);

    if (!connectedAccountId) {
      setChargeError("No connected account found. Please connect first.");
      setChargeLoading(false);
      return;
    }

    if (!clonedPaymentMethodId.trim()) {
      setChargeError("Enter a cloned payment method ID (run step 1 or paste pm_…).");
      setChargeLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/pm-only/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectedAccountId,
          paymentMethodId: clonedPaymentMethodId.trim(),
          amount: Math.round(parseFloat(amount) * 100),
          currency,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to charge");
      }

      setChargeResult(data);
    } catch (err) {
      setChargeError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setChargeLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            PM-Only Clone + Charge
          </h1>
          <Link href="/" className="text-[#635BFF] hover:underline">
            ← Back to main flow
          </Link>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
          Clones a payment method from the partner account onto the connected
          account and charges it <strong>on-session</strong> — no Coverdash
          customer is created, no <code>paymentMethods.attach</code> call. The
          cloned PM is single-use and charged immediately. See{" "}
          <code>docs/pm-only-flow.md</code> for why. Use step 1 and step 2
          separately to inspect each API response.
        </div>

        {connectedAccountId ? (
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-10">
            <p className="text-sm text-gray-600">
              Connected account:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {connectedAccountId}
              </code>
            </p>

            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                1. Clone payment method
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Calls <code className="text-xs">POST /api/pm-only/clone-payment-method</code>
              </p>

              <form onSubmit={handleClone} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Customer ID
                  </label>
                  <input
                    type="text"
                    value={partnerCustomerId}
                    onChange={(e) => setPartnerCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="cus_xxxxxxxxxxxxx"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required by Stripe to authorize the clone (source customer on
                    the partner account).
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Payment Method ID
                  </label>
                  <input
                    type="text"
                    value={partnerCustomerPaymentId}
                    onChange={(e) =>
                      setPartnerCustomerPaymentId(e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="pm_xxxxxxxxxxxxx"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={cloneLoading}
                  className="w-full bg-[#635BFF] text-white py-2 px-4 rounded-md hover:bg-[#4F46E5] disabled:opacity-50"
                >
                  {cloneLoading ? "Cloning…" : "Clone PM"}
                </button>
              </form>

              {cloneError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{cloneError}</p>
                </div>
              )}

              {cloneResult && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md space-y-2">
                  <p className="text-green-800 font-semibold">
                    Clone succeeded
                  </p>
                  <p className="text-sm text-gray-700">
                    Cloned Payment Method ID:{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {cloneResult.paymentMethodId}
                    </code>
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600">
                      View full clone response
                    </summary>
                    <pre className="mt-2 text-xs text-gray-700 overflow-auto">
                      {JSON.stringify(cloneResult, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </section>

            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                2. Charge cloned PM
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Calls <code className="text-xs">POST /api/pm-only/charge</code>.
                The cloned PM ID is filled after step 1; you can edit it to test
                with any <code className="text-xs">pm_</code> on this connected
                account.
              </p>

              <form onSubmit={handleCharge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cloned Payment Method ID (on connected account)
                  </label>
                  <input
                    type="text"
                    value={clonedPaymentMethodId}
                    onChange={(e) => setClonedPaymentMethodId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="pm_xxxxxxxxxxxxx"
                    required
                  />
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
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="One-time PM charge"
                  />
                </div>

                <button
                  type="submit"
                  disabled={chargeLoading}
                  className="w-full bg-[#0F766E] text-white py-2 px-4 rounded-md hover:bg-[#0D9488] disabled:opacity-50"
                >
                  {chargeLoading ? "Charging…" : "Charge"}
                </button>
              </form>

              {chargeError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{chargeError}</p>
                </div>
              )}

              {chargeResult && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md space-y-2">
                  <p className="text-green-800 font-semibold">
                    Charge completed
                  </p>
                  <p className="text-sm text-gray-700">
                    PaymentIntent status:{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {chargeResult.paymentIntent?.status}
                    </code>
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600">
                      View full charge response
                    </summary>
                    <pre className="mt-2 text-xs text-gray-700 overflow-auto">
                      {JSON.stringify(chargeResult, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-600">
              No connected account. Go{" "}
              <Link href="/" className="text-[#635BFF] hover:underline">
                back to the main flow
              </Link>{" "}
              and connect first.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
