import { withPrisma } from "../../../lib/api/withPrisma"
import { stripeInstance } from "../../../lib/api/stripe"

export default withPrisma(async function (req, res, prisma) {
  if (req.method !== "POST") {
    return res.status(404).end()
  }

  let customer = await prisma.customer.findUnique({
    where: { id: req.body.customerId },
    select: { id: true },
  })

  if (!customer) {
    const stripe = stripeInstance()
    const stripeCustomer = await stripe.customers.create()
    customer = await prisma.customer.create({
      data: { stripeCustomerId: stripeCustomer.id },
      select: { id: true },
    })
  }

  res.status(200).json(customer)
})
