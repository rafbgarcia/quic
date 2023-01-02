export const config = { api: { bodyParser: false } }

import { NextApiRequest, NextApiResponse } from "next"
import { buffer } from "node:stream/consumers"
import Stripe from "stripe"
import { prisma as prismaClient } from "../../../lib/api/db"
import { ServerlessFunctionHandler } from "../../../lib/api/serverlessHandler"
import { stripe } from "../../../lib/api/stripe"

export default ServerlessFunctionHandler({
  allowedMethods: ["POST"],
  handler: async function (req: NextApiRequest, res: NextApiResponse) {
    const sig = req.headers["stripe-signature"]!
    const rawBody = await buffer(req)
    const event: Stripe.Event = stripe.webhooks.constructEvent(rawBody, sig, process.env.ENDPOINT_SECRET!)

    if (eventHandlers[event.type]) {
      console.log(`>>> Handling "${event.type}"`)
      await eventHandlers[event.type](prismaClient, event.data.object)
    } else {
      console.log(`>>> Unhandled "${event.type}"`, event.data.object)
    }

    res.status(200).send(">>> Success")
  },
})

const eventHandlers: { [key: string]: (prisma: typeof prismaClient, object: any) => void } = {
  "payment_intent.succeeded": async (prisma, paymentIntent: Stripe.PaymentIntent) => {
    if (paymentIntent.status === "succeeded") {
      let paymentMethod
      if (typeof paymentIntent.payment_method === "string") {
        const pm = await stripe.paymentMethods.retrieve(paymentIntent.payment_method)
        paymentMethod = pm.type
      } else if (paymentIntent.payment_method) {
        paymentMethod = paymentIntent?.payment_method?.type
      }

      const promises: any = [
        prisma.completion.create({
          data: {
            requestId: paymentIntent.metadata.requestId,
            paymentIntentId: paymentIntent.id,
            amountReceived: paymentIntent.amount_received,
            paymentMethod,
          },
        }),
      ]

      if (paymentIntent.metadata.shouldDelete === "yes") {
        promises.push(prisma.code.delete({ where: { id: paymentIntent.metadata.code } }))
      }

      await Promise.all(promises)
    }
  },
}
