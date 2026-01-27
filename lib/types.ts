export interface OAuthTokenResponse {
  access_token: string;
  livemode: boolean;
  refresh_token: string;
  token_type: string;
  stripe_publishable_key: string;
  stripe_user_id: string;
  scope: string;
}

export interface ClonePaymentMethodRequest {
  connectedAccountId: string;
  customerId: string;
  paymentMethodId: string;
}

export interface CreateChargeRequest {
  connectedAccountId: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface CreateCustomerRequest {
  connectedAccountId: string;
  email: string;
  name: string;
  paymentMethodId?: string;
}
