# Clone + Customer Flow (`/` → Clone Payment Method)

This is the **full** flow: clone a payment method from the partner's Stripe account onto Coverdash's connected account, create a Coverdash-side customer, attach the cloned PM to that customer, and set it as the default. Coverdash can then charge that customer + PM repeatedly (including off-session) for the lifetime of the agreement.

## Actors and accounts

- **Partner Stripe account** — the partner's own Stripe account. Holds the original customer (`partnerCustomerId`) and their saved payment method (`partnerCustomerPaymentId`). Accessed via `PARTNER_STRIPE_SECRET_KEY`.
- **Coverdash connected account** — Coverdash's Stripe account as a connected account under the partner's platform. Identified by `connectedAccountId` (e.g. `acct_...`). The cloned PM and the new Coverdash customer live here. Accessed via the partner key + the `stripeAccount` header.

## Entry points

- UI: [`pages/index.tsx`](../pages/index.tsx) → [`components/CloneTrigger.tsx`](../components/CloneTrigger.tsx)
- API: [`pages/api/clone/payment-method.ts`](../pages/api/clone/payment-method.ts)
- Orchestration: `cloneAndAttachPaymentMethod` in [`lib/stripe.ts`](../lib/stripe.ts)

## Step-by-step

### 1. Create a Coverdash customer on the connected account

```ts
stripe.customers.create(
  { email, name },
  { stripeAccount: connectedAccountId }
);
```

Uses the partner key, but the `stripeAccount` header makes Stripe create the customer **inside the connected account**. This new customer (`coverdashCustomer`) is a separate, independent Stripe object from the partner-side customer — different ID, different account, no automatic link between them.

Why do this first? Because we want the payment method to end up attached to *this* customer, so we need the customer to exist before the attach step.

### 2. Clone the partner's payment method onto the connected account

```ts
stripe.paymentMethods.create(
  {
    customer: partnerCustomerId,        // SOURCE customer on partner account
    payment_method: partnerCustomerPaymentId, // SOURCE PM on partner account
  },
  { stripeAccount: connectedAccountId } // DESTINATION account
);
```

**Critical detail:** when cloning, the `customer` field refers to the **source** customer on the partner account, not a destination customer on the connected account. Stripe uses this to verify that the partner customer actually owns that payment method — it's authorization, not attachment. The clone returns a new PM object that lives on the connected account and is **not attached to anything yet**.

### 3. Attach the cloned PM to the Coverdash customer

```ts
stripe.paymentMethods.attach(
  coverdashPaymentMethod.id,
  { customer: coverdashCustomer.id },
  { stripeAccount: connectedAccountId }
);
```

This is the step that links the cloned PM to the Coverdash-side customer. Without it, the PM exists on the connected account but isn't associated with any customer — which is fine for a one-shot charge, but blocks off-session reuse.

**Why does `paymentMethods.attach` require a customer?** Because Stripe's whole model for reusing a saved payment method hinges on the idea that the credential is *owned* by a customer. Attaching establishes that ownership and the implicit authorization to charge later. Without a customer, there's no "owner" and no recorded mandate — so Stripe wouldn't know whose card it is in a reuse context, wouldn't have a place to store the mandate, and wouldn't have anything to pass to `off_session` charges (which require `customer` + `payment_method` together to prove prior authorization). An unattached PM is essentially a single-use token; an attached PM is a saved, reusable credential.

### 4. Set the cloned PM as the customer's default

```ts
stripe.customers.update(
  coverdashCustomer.id,
  { invoice_settings: { default_payment_method: coverdashPaymentMethod.id } },
  { stripeAccount: connectedAccountId }
);
```

Convenience for downstream charges — future PaymentIntents / subscriptions on this customer use this PM without needing to specify it explicitly.

## Charging after the fact

Once step 3 is done, you have a customer + attached PM on the connected account. You can charge with `off_session: true` because Stripe has a persistent customer+PM pairing and an associated mandate:

```ts
stripe.paymentIntents.create(
  {
    customer: coverdashCustomer.id,
    payment_method: coverdashPaymentMethod.id,
    amount,
    currency,
    off_session: true,
    confirm: true,
  },
  { stripeAccount: connectedAccountId }
);
```

This is what [`createDirectCharge`](../lib/stripe.ts) does.

## When to use this flow

- You need to charge the same cardholder more than once (renewals, installments, usage-based billing).
- Charges may happen when the user is not present (off-session).
- You want a persistent Coverdash-side record of the customer.

If none of those apply, the [PM-only flow](./pm-only-flow.md) is simpler.
