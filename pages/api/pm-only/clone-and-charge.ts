import {
  createDirectChargeWithoutCustomer,
  createPaymentMethodOnConnectedAccount,
} from "@/lib/stripe";
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
      partnerCustomerId,
      partnerCustomerPaymentId,
      amount,
      currency,
      description,
    } = req.body;

    if (
      !connectedAccountId ||
      !partnerCustomerId ||
      !partnerCustomerPaymentId ||
      !amount ||
      !currency
    ) {
      return res.status(400).json({
        error:
          "connectedAccountId, partnerCustomerId, partnerCustomerPaymentId, amount, and currency are required",
      });
    }

    const coverdashPaymentMethod = await createPaymentMethodOnConnectedAccount(
      connectedAccountId,
      partnerCustomerId,
      partnerCustomerPaymentId
    );

    const paymentIntent = await createDirectChargeWithoutCustomer(
      connectedAccountId,
      coverdashPaymentMethod.id,
      amount,
      currency,
      description
    );

    return res.json({
      paymentMethodId: coverdashPaymentMethod.id,
      paymentMethod: coverdashPaymentMethod,
      paymentIntent,
    });
  } catch (error) {
    console.error("PM-only clone-and-charge error:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to clone and charge payment method",
    });
  }
}
