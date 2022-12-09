import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../../lib/api/db"
import { stripe, STRIPE_API_VERSION } from "../../../lib/api/stripe"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    return res.status(400).json({ quicError: "Invalid METHOD" })
  }

  const { code, customerId } = req.body

  const charge = await prisma.charge.findFirstOrThrow({
    where: { code },
    include: { company: true },
  })
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id: customerId },
    select: { stripeCustomerId: true },
  })
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.stripeCustomerId },
    { apiVersion: STRIPE_API_VERSION }
  )
  const paymentIntent = await stripe.paymentIntents.update(charge.stripePaymentIntentId, {
    customer: customer.stripeCustomerId,
    setup_future_usage: "on_session",
  })

  res.status(200).json({
    amount: charge.amount,
    company: charge.company.name,
    paymentIntentClientSecret: paymentIntent.client_secret,
    customerEphemeralKeySecret: ephemeralKey.secret,
    customerId: customer.stripeCustomerId,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  })
}
