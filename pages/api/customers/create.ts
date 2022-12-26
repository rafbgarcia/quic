import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../../lib/api/db"
import { stripe } from "../../../lib/api/stripe"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(404).end()
  }

  let customer = await prisma.customer.findUnique({
    where: { id: req.body.customerId },
    select: { id: true },
  })

  if (!customer) {
    const stripeCustomer = await stripe.customers.create()
    customer = await prisma.customer.create({
      data: { id: stripeCustomer.id },
      select: { id: true },
    })
  }

  res.status(200).json(customer)
}
