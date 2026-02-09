import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <Card>
      <CardHeader>
        <CardTitle>Clone Payment Method</CardTitle>
        <CardDescription>
          Clone a payment method from your platform account to the connected account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleClone} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform-customer-id">Platform Customer ID</Label>
            <Input
              id="platform-customer-id"
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="cus_xxxxxxxxxxxxx"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform-payment-method-id">Platform Payment Method ID</Label>
            <Input
              id="platform-payment-method-id"
              type="text"
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              placeholder="pm_xxxxxxxxxxxxx"
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-[#635BFF] hover:bg-[#4F46E5]">
            {isLoading ? "Cloning..." : "Clone Payment Method"}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Clone failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert className="mt-4">
            <AlertTitle>Payment method cloned successfully!</AlertTitle>
            <AlertDescription>
              <p className="text-sm mt-1">
                Cloned Payment Method ID:{" "}
                <code className="bg-muted px-2 py-1 rounded">{result.id}</code>
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
