import { currentAdmin } from "../../../../lib/api/admin"
import { withPrisma } from "../../../../lib/api/prisma"
import { stripeInstance } from "../../../../lib/api/stripe"

export default withPrisma(async function (req, res, prisma) {
  const admin = await currentAdmin(req.headers.authorization!, prisma)
  if (!admin) {
    return res.status(403).json({ error: "Não autorizado" })
  }

  const stripe = stripeInstance()
  const accountLink = await stripe.accountLinks.create({
    account: admin.company.stripeAccountId,
    refresh_url: "http://localhost:8000/",
    return_url: "http://localhost:8000/",
    type: "account_onboarding",
  })

  res.status(200).json({ url: accountLink.url })
})
