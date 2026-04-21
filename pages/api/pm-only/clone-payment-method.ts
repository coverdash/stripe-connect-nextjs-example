import { createPaymentMethodOnConnectedAccount } from "@/lib/stripe";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { connectedAccountId, partnerCustomerId, partnerCustomerPaymentId } =
      req.body;

    if (
      !connectedAccountId ||
      !partnerCustomerId ||
      !partnerCustomerPaymentId
    ) {
      return res.status(400).json({
        error:
          "connectedAccountId, partnerCustomerId, and partnerCustomerPaymentId are required",
      });
    }

    const paymentMethod = await createPaymentMethodOnConnectedAccount(
      connectedAccountId,
      partnerCustomerId,
      partnerCustomerPaymentId,
    );

    return res.json({
      paymentMethodId: paymentMethod.id,
      paymentMethod,
    });
  } catch (error) {
    console.error("PM-only clone error:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to clone payment method",
    });
  }
}
