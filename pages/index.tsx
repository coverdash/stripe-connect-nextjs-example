import CloneTrigger from "@/components/CloneTrigger";
import ConnectButton from "@/components/ConnectButton";
import PaymentForm from "@/components/PaymentForm";
import { getConnectedAccountIdClient } from "@/lib/storage";
import { useEffect, useState } from "react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(
    null
  );
  const [clonedPaymentMethodId, setClonedPaymentMethodId] = useState("");
  const [connectedCustomerId, setConnectedCustomerId] = useState("");

  useEffect(() => {
    const accountId = getConnectedAccountIdClient();
    setConnectedAccountId(accountId);
    setIsConnected(!!accountId);
  }, []);

  const handleDisconnect = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("stripe_connected_account_id");
      setIsConnected(false);
      setConnectedAccountId(null);
      setClonedPaymentMethodId("");
      setConnectedCustomerId("");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Stripe Connect OAuth Example
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Demonstrates how to connect a Stripe account via OAuth and clone
            payment methods for direct charges
          </p>
        </div>

        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Connect Your Stripe Account
            </h2>
            <p className="text-gray-600 mb-6">
              Click the button below to authorize this platform to process
              payments on your behalf
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Connected Account</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Account ID:{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {connectedAccountId}
                    </code>
                  </p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Disconnect
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                How to use this demo:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>
                  First, set up a payment method on your platform account (use
                  Stripe Dashboard)
                </li>
                <li>
                  Clone the payment method and create a connected-account customer
                </li>
                <li>
                  Use the cloned payment method + connected customer ID to create
                  a direct charge
                </li>
                <li>
                  Coverdash can then reuse that customer + payment method for
                  future renewals/installments
                </li>
              </ol>
            </div>

            <CloneTrigger
              onCloneSuccess={({ paymentMethodId, customerId }) => {
                setClonedPaymentMethodId(paymentMethodId);
                setConnectedCustomerId(customerId);
              }}
            />
            <PaymentForm
              defaultPaymentMethodId={clonedPaymentMethodId}
              defaultCustomerId={connectedCustomerId}
            />

            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="font-bold mb-2">📚 Documentation</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <a
                    href="https://docs.stripe.com/connect/direct-charges-multiple-accounts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#635BFF] hover:underline"
                  >
                    Stripe: Share payment methods across accounts →
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.stripe.com/connect/oauth-standard-accounts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#635BFF] hover:underline"
                  >
                    Stripe Connect OAuth Reference →
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
