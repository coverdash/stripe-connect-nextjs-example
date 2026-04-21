# PM-Only Flow (`/pm-only`)

A slimmer alternative to the [full clone + customer flow](./clone-with-customer-flow.md). Clones the partner's payment method onto Coverdash's connected account and charges it immediately — **no Coverdash customer, no attach, no default PM**. The cloned PM is a single-use token in practice.

## Entry points

- UI: [`pages/pm-only.tsx`](../pages/pm-only.tsx) — two steps: clone, then charge (separate responses for testing).
- API (split):
  - [`pages/api/pm-only/clone-payment-method.ts`](../pages/api/pm-only/clone-payment-method.ts) — clone only.
  - [`pages/api/pm-only/charge.ts`](../pages/api/pm-only/charge.ts) — charge a cloned `pm_` on the connected account.
- API (combined, optional): [`pages/api/pm-only/clone-and-charge.ts`](../pages/api/pm-only/clone-and-charge.ts) — same behavior as calling clone then charge in one request.
- Lib: `createPaymentMethodOnConnectedAccount` + `createDirectChargeWithoutCustomer` in [`lib/stripe.ts`](../lib/stripe.ts)

## Step-by-step

### 1. Clone the partner's payment method onto the connected account

```ts
stripe.paymentMethods.create(
  {
    customer: partnerCustomerId,        // SOURCE customer on partner account
    payment_method: partnerCustomerPaymentId, // SOURCE PM on partner account
  },
  { stripeAccount: connectedAccountId } // DESTINATION account
);
```

Identical to step 2 of the full flow. The `customer` field is the partner-side customer (authorization), not a destination customer. The returned PM lives on the connected account and is unattached.

### 2. Charge the cloned PM directly, on-session

```ts
stripe.paymentIntents.create(
  {
    payment_method: coverdashPaymentMethod.id,
    amount,
    currency,
    confirm: true,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
  },
  { stripeAccount: connectedAccountId }
);
```

No `customer`. No `off_session`. `allow_redirects: "never"` tells Stripe to fail fast if the card would require a 3DS redirect — since there's no return URL in a backend-only flow, a redirect-requiring card can't complete.

## Why no customer? And why does it matter?

### `paymentMethods.attach` requires a customer — full stop

The attach call's entire purpose is to link a PM to a customer. The `customer` parameter is required, not optional. Attaching says "this card belongs to this customer and they've authorized future use." Without a customer on the receiving end, there's nothing meaningful to attach to.

### Charging without a customer is allowed — but only on-session

`paymentIntents.create` lets you pass `payment_method` without `customer` and charge it once. This is how "guest checkout" works: tokenize the card, charge it, never see it again. What you **cannot** do is combine this with `off_session: true` — off-session charges assert "the user previously authorized me to charge this saved credential while they weren't watching," which only makes sense when there's a customer+PM pairing with a recorded mandate. Stripe will reject `off_session: true` without a `customer`.

So the rules shake out like this:

| Scenario                             | Customer? | Attach? | `off_session`? |
|--------------------------------------|-----------|---------|----------------|
| One-shot user-present charge         | No        | No      | No             |
| Saved card, user present             | Yes       | Yes     | No             |
| Saved card, background/recurring     | Yes       | Yes     | Yes            |
| Saved card, background, no customer  | ❌ impossible                         |

The PM-only flow is row 1. The full flow is rows 2–3.

### What "on-session" really means here

The server-side call happens without the user's browser in the loop, so "on-session" is a bit of a lie — what we're really claiming to Stripe is that this is an initial, authorized charge, not a reuse of a saved credential. In practice this works for Coverdash's use case as long as:

1. The partner has the cardholder's consent to initiate this charge.
2. The card doesn't require 3DS / SCA (which would need a return URL and a browser round-trip).

If SCA is required and `allow_redirects: "never"` is set, the PaymentIntent will end up in `requires_action` and you'll have to fall back to a richer flow (hand the client secret to the frontend, complete 3DS there).

## When to use this flow

- Single, immediate charge per cloned PM.
- You don't need a Coverdash-side customer record.
- You're willing to re-clone the PM for every charge (cheap but adds API calls).
- SCA exposure is acceptable or the cards in play don't require it.

## When NOT to use this flow

- You need to charge the same PM later, in the background. Use the [full flow](./clone-with-customer-flow.md) — `off_session` without a customer is a non-starter.
- You need a durable Coverdash-side customer for reporting, refunds against a stable ID, or future receipts.
