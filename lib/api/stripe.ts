import Stripe from "stripe"

export const STRIPE_API_VERSION = "2022-11-15"

export function stripeInstance() {
  return new Stripe(process.env.STRIPE_API_KEY!, { apiVersion: STRIPE_API_VERSION })
}
