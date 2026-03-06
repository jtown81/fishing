/**
 * Supabase Edge Function: stripe-webhook
 * Receives Stripe webhook events and updates user_subscriptions table.
 *
 * Uses constructEventAsync (required in Deno — NOT constructEvent).
 * Always returns HTTP 200 for unhandled event types.
 */
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient()
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const proPriceId = Deno.env.get('STRIPE_PRO_PRICE_ID')!
const orgPriceId = Deno.env.get('STRIPE_ORG_PRICE_ID')!

function priceIdToTier(priceId: string): 'pro' | 'org' | 'free' {
  if (priceId === proPriceId) return 'pro'
  if (priceId === orgPriceId) return 'org'
  return 'free'
}

serve(async (req) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    return new Response(message, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        const customerId = session.customer as string

        if (!userId) {
          console.error('checkout.session.completed: missing supabase_user_id in metadata')
          break
        }

        // Retrieve the subscription to get the price ID for tier mapping
        let tier: 'free' | 'pro' | 'org' = 'free'
        let subscriptionId: string | null = null
        let periodEnd: string | null = null

        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          subscriptionId = sub.id
          const priceId = sub.items.data[0]?.price.id ?? ''
          tier = priceIdToTier(priceId)
          periodEnd = new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString()
        }

        await supabase.from('user_subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          tier,
          status: 'active',
          current_period_end: periodEnd,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        const customerId = sub.customer as string
        const priceId = sub.items.data[0]?.price.id ?? ''
        const tier = priceIdToTier(priceId)
        const status = sub.status as 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
        const periodEnd = new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString()

        if (userId) {
          await supabase.from('user_subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id,
            tier,
            status,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' })
        } else {
          // Fallback: look up by stripe_customer_id
          await supabase.from('user_subscriptions')
            .update({ tier, status, current_period_end: periodEnd, updated_at: new Date().toISOString() })
            .eq('stripe_customer_id', customerId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        const customerId = sub.customer as string

        const update = {
          tier: 'free' as const,
          status: 'canceled' as const,
          stripe_subscription_id: null,
          current_period_end: null,
          updated_at: new Date().toISOString()
        }

        if (userId) {
          await supabase.from('user_subscriptions').update(update).eq('user_id', userId)
        } else {
          await supabase.from('user_subscriptions').update(update).eq('stripe_customer_id', customerId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await supabase.from('user_subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', customerId)
        break
      }

      default:
        // Intentionally unhandled — always return 200
        break
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err)
    // Still return 200 to prevent Stripe retries for app-level errors
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
