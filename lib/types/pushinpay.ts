export interface PushinpayWebhookEvent {
  event: "subscription_activated" | "subscription_renewed" | "subscription_canceled" | "payment_failed"
  data: {
    subscription_id: string
    customer_email: string
    amount?: number
    currency?: string
    created_at?: string
  }
}

export interface InviteRecord {
  id: string
  token: string
  pushinpay_subscription_id: string
  customer_email: string
  created_at: string
  expires_at: string
  used_at: string | null
  used_by: string | null
}

export interface UserSubscription {
  id: string
  user_id: string
  pushinpay_subscription_id: string
  customer_email: string
  status: "active" | "inactive" | "cancelled"
  valid_until: string
  created_at: string
  updated_at: string
}
