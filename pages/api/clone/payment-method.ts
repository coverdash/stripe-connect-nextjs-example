import { clonePaymentMethod } from "@/lib/stripe";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { connectedAccountId, customerId, paymentMethodId } = req.body;

    if (!connectedAccountId || !customerId || !paymentMethodId) {
      return res.status(400).json({
        error: "connectedAccountId, customerId, and paymentMethodId are required",
      });
    }

    const clonedPM = await clonePaymentMethod(
      connectedAccountId,
      customerId,
      paymentMethodId
    );

    return res.json(clonedPM);
  } catch (error) {
    console.error("Payment method cloning error:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to clone payment method",
    });
  }
}
