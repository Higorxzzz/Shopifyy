import { createClient } from "@/lib/supabase/server"
import type { UserSubscription } from "@/lib/types/pushinpay"

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("user_subscriptions").select("*").eq("user_id", userId).single()

  if (error || !data) {
    return null
  }

  return data as UserSubscription
}

export async function isSubscriptionActive(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)

  if (!subscription) {
    return false
  }

  return subscription.status === "active" && new Date(subscription.valid_until) > new Date()
}
