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
    const event: Stripe.Event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.CONNECT_ENDPOINT_SECRET!
    )

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
  "account.updated": async (prisma, account: Stripe.Account) => {
    await prisma.business.update({
      where: { id: account.id },
      data: { stripeMeta: account as any },
    })
  },
}
