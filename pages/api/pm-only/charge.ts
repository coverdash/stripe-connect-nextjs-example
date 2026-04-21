import { createDirectChargeWithoutCustomer } from "@/lib/stripe";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      connectedAccountId,
      paymentMethodId,
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

    const paymentIntent = await createDirectChargeWithoutCustomer(
      connectedAccountId,
      paymentMethodId,
      amount,
      currency,
      description,
    );

    return res.json({
      paymentMethodId,
      paymentIntent,
    });
  } catch (error) {
    console.error("PM-only charge error:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to charge payment method",
    });
  }
}
