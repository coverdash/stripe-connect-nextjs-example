import Stripe from "stripe";
import { config } from "./config";

export function getStripeClient(): Stripe {
  return new Stripe(config.stripe.secretKey, {
    apiVersion: "2024-11-20.acacia",
  });
}

export async function clonePaymentMethod(
  connectedAccountId: string,
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  const stripe = getStripeClient();

  const clonedPaymentMethod = await stripe.paymentMethods.create(
    {
      customer: customerId,
      payment_method: paymentMethodId,
    },
    {
      stripeAccount: connectedAccountId,
    }
  );

  return clonedPaymentMethod;
}

export async function createDirectCharge(
  connectedAccountId: string,
  paymentMethodId: string,
  amount: number,
  currency: string,
  description?: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient();

  const paymentIntent = await stripe.paymentIntents.create(
    {
      payment_method: paymentMethodId,
      amount,
      currency,
      description,
      off_session: true,
      confirm: true,
    },
    {
      stripeAccount: connectedAccountId,
    }
  );

  return paymentIntent;
}

export async function createCustomerOnConnectedAccount(
  connectedAccountId: string,
  email: string,
  name: string,
  paymentMethodId?: string
): Promise<Stripe.Customer> {
  const stripe = getStripeClient();

  const params: Stripe.CustomerCreateParams = {
    email,
    name,
  };

  if (paymentMethodId) {
    params.payment_method = paymentMethodId;
  }

  const customer = await stripe.customers.create(params, {
    stripeAccount: connectedAccountId,
  });

  return customer;
}

export async function getConnectedAccountDetails(
  connectedAccountId: string
): Promise<Stripe.Account> {
  const stripe = getStripeClient();
  return stripe.accounts.retrieve(connectedAccountId);
}
