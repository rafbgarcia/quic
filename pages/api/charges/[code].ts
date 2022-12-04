import { withPrisma } from "../../../lib/api/prisma"
import { stripeInstance } from "../../../lib/api/stripe"

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
        select: { stripeAccountId: true },
      },
    },
  })

  if (!charge) {
    return res.status(404).json({ quicError: "Not found" })
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(charge.stripePaymentIntentId, {
    stripeAccount: charge.company.stripeAccountId,
  })

  res.status(200).json({
    charge,
    paymentIntent,
    // ephemeralKey: ephemeralKey.secret,
    // customer: customer.id,
  })
})
