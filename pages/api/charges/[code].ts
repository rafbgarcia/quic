import { request } from "http"
import { withPrisma } from "../../../lib/api/prisma"
import { stripeInstance, STRIPE_API_VERSION } from "../../../lib/api/stripe"

export default withPrisma(async function (req, res, prisma) {
  const stripe = stripeInstance()
  const code = req.query.code as string
  const charge = await prisma.charge.findFirst({
    where: { code },
    select: {
      amount: true,
      code: true,
      stripePaymentIntentId: true,
      company: {
        select: { stripeAccountId: true, name: true },
      },
    },
  })

  if (!charge) {
    return res.status(404).json({ quicError: "Not found" })
  }

  if (req.method === "GET") {
    // Admin access

    const paymentIntent = await stripe.paymentIntents.retrieve(charge.stripePaymentIntentId)

    res.status(200).json({
      charge,
      paymentIntent,
    })
  } else if (req.method === "PATCH") {
    // Customer Access

    const customer = await prisma.customer.findUniqueOrThrow({
      where: { id: req.body.customerId },
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
  } else {
    res.status(400).json({ quicError: "Invalid METHOD" })
  }
})
