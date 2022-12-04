import Stripe from "stripe"

export function stripeInstance() {
  return new Stripe(process.env.STRIPE_API_KEY!, { apiVersion: "2022-11-15" })
}
