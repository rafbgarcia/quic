import Stripe from "stripe"

export const STRIPE_API_VERSION = "2022-11-15"

export const stripe = new Stripe(process.env.STRIPE_API_KEY!, { apiVersion: STRIPE_API_VERSION })
export const stripeBusiness = function (stripeAccount: string) {
  return new Stripe(process.env.STRIPE_API_KEY!, { apiVersion: STRIPE_API_VERSION, stripeAccount })
}
