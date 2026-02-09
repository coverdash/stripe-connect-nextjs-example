import { createCoverdashIndependentCharge } from "@/lib/stripe";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { customerId, paymentMethodId, amount, currency, description } = req.body;

    if (!customerId || !paymentMethodId || !amount || !currency) {
      return res.status(400).json({
        error: "customerId, paymentMethodId, amount, and currency are required",
      });
    }

    const paymentIntent = await createCoverdashIndependentCharge(
      customerId,
      paymentMethodId,
      amount,
      currency,
      description
    );

    return res.json(paymentIntent);
  } catch (error) {
    console.error("Coverdash independent charge error:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to create Coverdash independent charge",
    });
  }
}
