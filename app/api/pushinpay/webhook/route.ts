import { type NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServiceClient()

    console.log("[v0] Pushinpay webhook received:", body)

    // Verify webhook signature if needed (add your verification logic here)
    // const signature = request.headers.get("x-pushinpay-signature");

    const { event, data } = body

    switch (event) {
      case "subscription_activated":
        await handleSubscriptionActivated(supabase, data)
        break

      case "subscription_renewed":
        await handleSubscriptionRenewed(supabase, data)
        break

      case "subscription_canceled":
      case "payment_failed":
        await handleSubscriptionInactive(supabase, data)
        break

      default:
        console.log("[v0] Unhandled webhook event:", event)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleSubscriptionActivated(supabase: any, data: any) {
  const { subscription_id, customer_email } = data

  // Generate UUID token for invite
  const { data: invite, error } = await supabase
    .from("invites")
    .insert({
      pushinpay_subscription_id: subscription_id,
      customer_email: customer_email,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating invite:", error)
    return
  }

  console.log("[v0] Invite created:", invite)

  // Here you would send the registration link via email
  // Example: await sendRegistrationEmail(customer_email, invite.token);

  // For now, just log the registration link
  const registrationLink = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/cadastro?token=${invite.token}`
  console.log("[v0] Registration link:", registrationLink)
}

async function handleSubscriptionRenewed(supabase: any, data: any) {
  const { subscription_id } = data

  // Update valid_until to now() + 30 days
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 30)

  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      valid_until: validUntil.toISOString(),
      status: "active",
    })
    .eq("pushinpay_subscription_id", subscription_id)

  if (error) {
    console.error("[v0] Error renewing subscription:", error)
    return
  }

  console.log("[v0] Subscription renewed for:", subscription_id)
}

async function handleSubscriptionInactive(supabase: any, data: any) {
  const { subscription_id } = data

  // Mark user as inactive
  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      status: "inactive",
    })
    .eq("pushinpay_subscription_id", subscription_id)

  if (error) {
    console.error("[v0] Error marking subscription inactive:", error)
    return
  }

  console.log("[v0] Subscription marked inactive:", subscription_id)
}
