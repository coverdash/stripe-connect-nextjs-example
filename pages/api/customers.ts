import { createCustomerOnConnectedAccount } from "@/lib/stripe";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { connectedAccountId, email, name, paymentMethodId } = req.body;

    if (!connectedAccountId || !email || !name) {
      return res.status(400).json({
        error: "connectedAccountId, email, and name are required",
      });
    }

    const customer = await createCustomerOnConnectedAccount(
      connectedAccountId,
      email,
      name,
      paymentMethodId
    );

    return res.json(customer);
  } catch (error) {
    console.error("Customer creation error:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to create customer",
    });
  }
}
