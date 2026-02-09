import CloneTrigger from "@/components/CloneTrigger";
import ConnectButton from "@/components/ConnectButton";
import PaymentForm from "@/components/PaymentForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getConnectedAccountIdClient } from "@/lib/storage";
import { useEffect, useState } from "react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);

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
    }
  };

  return (
    <main className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Stripe Connect OAuth Example</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Demonstrates how to connect a Stripe account via OAuth and clone payment methods for direct charges.
          </p>
        </div>

        {!isConnected ? (
          <Card className="p-2">
            <CardHeader className="text-center">
              <CardTitle>Connect Your Stripe Account</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Authorize this platform to process payments on your behalf.
              </p>
              <ConnectButton />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 flex justify-between items-center gap-3">
                <div>
                  <h2 className="text-xl font-bold">Connected Account</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Account ID: <code className="bg-muted px-2 py-1 rounded text-xs">{connectedAccountId}</code>
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDisconnect}>Disconnect</Button>
              </CardContent>
            </Card>

            <Alert>
              <AlertTitle>How to use this demo</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal list-inside space-y-1 text-sm mt-2">
                  <li>Set up a payment method on your platform account in Stripe.</li>
                  <li>Clone the payment method to the connected account.</li>
                  <li>Use the cloned payment method ID to create a direct charge.</li>
                  <li>The charge appears on the connected account dashboard.</li>
                </ol>
              </AlertDescription>
            </Alert>

            <CloneTrigger />
            <PaymentForm />

            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
