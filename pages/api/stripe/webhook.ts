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

  "payment.created": async (prisma, charge: Stripe.Charge) => {
    /*
    {
      id: 'py_1MBrBWQjZYJs10X6w58oLXR6',
      object: 'charge',
      amount: 999,
      amount_captured: 999,
      amount_refunded: 0,
      application: 'ca_MkkJm0fg6LBnNSKyiDmNAOoxZVa32Wai',
      application_fee: 'fee_1MBrBXQjZYJs10X6hDV57Ld2',
      application_fee_amount: 10,
      balance_transaction: 'txn_1MBrBXQjZYJs10X63eU1LoMe',
      billing_details: {
        address: {
          city: null,
          country: null,
          line1: null,
          line2: null,
          postal_code: null,
          state: null
        },
        email: null,
        name: null,
        phone: null
      },
      calculated_statement_descriptor: null,
      captured: true,
      created: 1670294827,
      currency: 'brl',
      customer: null,
      description: null,
      destination: null,
      dispute: null,
      disputed: false,
      failure_balance_transaction: null,
      failure_code: null,
      failure_message: null,
      fraud_details: {},
      invoice: null,
      livemode: false,
      metadata: {},
      on_behalf_of: null,
      order: null,
      outcome: null,
      paid: true,
      payment_intent: null,
      payment_method: null,
      payment_method_details: { stripe_account: {}, type: 'stripe_account' },
      receipt_email: null,
      receipt_number: null,
      receipt_url: 'https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xTUJyM2lRalpZSnMxMFg2KKvaupwGMgYn5LJMrOs6LBYM1QO8TAblIY9qFAiIpp6qNrWSq9KqxfhTdmJWmWZakQ-3YRrUtICzd0dX',
      refunded: false,
      review: null,
      shipping: null,
      source: {
        id: 'acct_178aXeHIxxiiOM1T',
        object: 'account',
        application_icon: 'https://files.stripe.com/links/MDB8YWNjdF8xNzhhWGVISXh4aWlPTTFUfGZsX2xpdmVfVU5lS0RzamlOVzV0SmhyaUJUaU1WdzdT00BAwEJAQE',
        application_name: 'Quic'
      },
      source_transfer: 'tr_3MBrAqHIxxiiOM1T1v1I91z7',
      statement_descriptor: null,
      statement_descriptor_suffix: null,
      status: 'succeeded',
      transfer_data: null,
      transfer_group: null
    }
    */
    console.log(">>> charge", charge)
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
    console.log(event.object)
  }

  res.status(200).send(">>> Success")
})
