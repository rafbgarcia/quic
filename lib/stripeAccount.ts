import Stripe from "stripe"

export function hasMissingRequirements(stripeMeta: Stripe.Account) {
  try {
    return stripeMeta.requirements!.currently_due!.length > 0
  } catch {
    return false
  }
}
