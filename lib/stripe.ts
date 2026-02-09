import Stripe from "stripe";
import { config } from "./config";

export function getStripeClient(): Stripe {
  return new Stripe(config.stripe.partnerSecretKey, {
    apiVersion: "2023-10-16",
  });
}

export function getCoverdashStripeClient(): Stripe {
  return new Stripe(config.stripe.coverdashSecretKey, {
    apiVersion: "2023-10-16",
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
  description?: string,
  customerId?: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient();

  const paymentIntent = await stripe.paymentIntents.create(
    {
      payment_method: paymentMethodId,
      customer: customerId,
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

export async function cloneAndAttachPaymentMethod(
  connectedAccountId: string,
  partnerCustomerId: string,
  paymentMethodId: string
): Promise<{ customer: Stripe.Customer; paymentMethod: Stripe.PaymentMethod }> {
  const stripe = getStripeClient();

  const clonedPaymentMethod = await clonePaymentMethod(
    connectedAccountId,
    partnerCustomerId,
    paymentMethodId
  );

  const connectedCustomer = await createCustomerOnConnectedAccount(
    connectedAccountId,
    `${partnerCustomerId}@example.com`,
    `Coverdash customer for ${partnerCustomerId}`
  );

  await stripe.paymentMethods.attach(
    clonedPaymentMethod.id,
    {
      customer: connectedCustomer.id,
    },
    {
      stripeAccount: connectedAccountId,
    }
  );

  await stripe.customers.update(
    connectedCustomer.id,
    {
      invoice_settings: {
        default_payment_method: clonedPaymentMethod.id,
      },
    },
    {
      stripeAccount: connectedAccountId,
    }
  );

  return {
    customer: connectedCustomer,
    paymentMethod: clonedPaymentMethod,
  };
}

export async function createCoverdashIndependentCharge(
  customerId: string,
  paymentMethodId: string,
  amount: number,
  currency: string,
  description?: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getCoverdashStripeClient();

  return stripe.paymentIntents.create({
    customer: customerId,
    payment_method: paymentMethodId,
    amount,
    currency,
    description,
    confirm: true,
    off_session: true,
  });
}

export async function getConnectedAccountDetails(
  connectedAccountId: string
): Promise<Stripe.Account> {
  const stripe = getStripeClient();
  return stripe.accounts.retrieve(connectedAccountId);
}
