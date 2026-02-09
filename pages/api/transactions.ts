import { createDirectCharge } from "@/lib/stripe";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      connectedAccountId,
      paymentMethodId,
      customerId,
      amount,
      currency,
      description,
    } = req.body;

    if (!connectedAccountId || !paymentMethodId || !amount || !currency) {
      return res.status(400).json({
        error:
          "connectedAccountId, paymentMethodId, amount, and currency are required",
      });
    }

    const paymentIntent = await createDirectCharge(
      connectedAccountId,
      paymentMethodId,
      amount,
      currency,
      description,
      customerId
    );

    return res.json(paymentIntent);
  } catch (error) {
    console.error("Transaction error:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to process transaction",
    });
  }
}
