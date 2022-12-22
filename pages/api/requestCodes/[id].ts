import Stripe from "stripe"
import { prisma } from "../../../lib/api/db"
import { ServerlessFunctionHandler } from "../../../lib/api/serverlessHandler"
import { stripe } from "../../../lib/api/stripe"

export default ServerlessFunctionHandler({
  allowedMethods: ["GET"],
  handler: async function (req, res) {
    const id = req.query.id as string
    const requestCode = await prisma.requestCode.findUnique({
      where: { id },
      include: { request: { include: { business: true } } },
    })

    let data: { requestCode: typeof requestCode; paymentIntent: null | Stripe.PaymentIntent } = {
      requestCode,
      paymentIntent: null,
    }
    if (requestCode?.request.stripePaymentIntentId) {
      data.paymentIntent = await stripe.paymentIntents.retrieve(requestCode.request.stripePaymentIntentId)
    }
    res.json(data)
  },
})
