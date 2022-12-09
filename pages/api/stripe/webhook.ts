export const config = { api: { bodyParser: false } }

import { NextApiRequest, NextApiResponse } from "next"
import { buffer } from "node:stream/consumers"
import Stripe from "stripe"
import { prisma as prismaClient } from "../../../lib/api/db"
import { stripe } from "../../../lib/api/stripe"

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const sig = req.headers["stripe-signature"]!
  const rawBody = await buffer(req)
  const event: Stripe.Event = stripe.webhooks.constructEvent(rawBody, sig, process.env.ENDPOINT_SECRET!)

  if (eventHandlers[event.type]) {
    console.log(">>> event.type", event.type)
    await eventHandlers[event.type](prismaClient, event.data.object)
  } else {
    console.log(`>>> Unhandled event type ${event.type}`, event.object)
  }

  res.status(200).send(">>> Success")
}

const eventHandlers: { [key: string]: (prisma: typeof prismaClient, object: any) => void } = {
  "payment_intent.succeeded": async (prisma, paymentIntent: Stripe.PaymentIntent) => {
    console.log(">>> paymentIntent", paymentIntent)

    await prisma.charge.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { paid: true },
    })
  },

  "charge.succeeded": async (prisma, charge: Stripe.Charge) => {
    // Taxa do Quic
    console.log(">>> charge", charge)
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
      },
    })
  },
}
