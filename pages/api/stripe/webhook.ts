export const config = {
  api: {
    bodyParser: false,
  },
}

import { buffer } from "node:stream/consumers"
import Stripe from "stripe"
// import { buffer } from "micro"
import { PrismaClientType, withPrisma } from "../../../lib/api/prisma"
import { stripeInstance } from "../../../lib/api/stripe"

/**
 * @param req.body
    {
      id: 'evt_1MA0vDQmrOuyXv5dXZEvewXW',
      object: 'event',
      account: 'acct_1MA0plQmrOuyXv5d',
      api_version: '2022-11-15',
      created: 1669855599,
      data: {
        object: {
          id: 'acct_1MA0plQmrOuyXv5d',
          object: 'account',
          business_profile: [Object],
          capabilities: [Object],
          charges_enabled: false,
          controller: [Object],
          country: 'BR',
          default_currency: 'brl',
          details_submitted: true,
          email: 'rafbgarcia@gmail.com',
          payouts_enabled: false,
          settings: [Object],
          type: 'standard',
          created: 1669855262,
          external_accounts: [Object],
          future_requirements: [Object],
          metadata: {},
          requirements: [Object],
          tos_acceptance: [Object]
        },
        previous_attributes: { capabilities: [Object] }
      },
      livemode: false,
      pending_webhooks: 2,
      request: { id: null, idempotency_key: null },
      type: 'account.updated'
    }
 */

const eventHandlers: { [key: string]: (prisma: PrismaClientType, object: any) => void } = {
  "payment_intent.succeeded": async (prisma, paymentIntent: Stripe.PaymentIntent) => {
    console.log(">>> paymentIntent", paymentIntent)

    await prisma.charge.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { paid: true },
    })
  },

  "charge.succeeded": async (prisma, charge: Stripe.Charge) => {
    // Taxa do Quic
    // console.log(">>> charge", charge)
  },

  "account.updated": async (prisma, account: Stripe.Account) => {
    await prisma.company.update({
      where: { stripeAccountId: account.id },
      data: {
        name: account.business_profile?.name || undefined,
        chargesEnabled: account.charges_enabled,
        detailsSubmitted: account.details_submitted,
      },
    })
  },
}
export default withPrisma(async function (req, res, prisma) {
  const stripe = stripeInstance()
  const sig = req.headers["stripe-signature"]!
  const rawBody = await buffer(req)
  const event: Stripe.Event = stripe.webhooks.constructEvent(rawBody, sig, process.env.ENDPOINT_SECRET!)

  console.log(">>> event.type", event.type)
  if (eventHandlers[event.type]) {
    await eventHandlers[event.type](prisma, event.data.object)
  } else {
    console.log(`>>> Unhandled event type ${event.type}`)
  }

  res.status(200).send(">>> Success")
})
