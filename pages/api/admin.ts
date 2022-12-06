import { currentAdmin } from "../../lib/api/admin"
import { withPrisma } from "../../lib/api/withPrisma"
import { stripeInstance } from "../../lib/api/stripe"

export default withPrisma(async function (req, res, prisma) {
  const admin = await currentAdmin(req.headers.authorization!, prisma)
  if (!admin) {
    return res.status(403).json({ quicError: "Forbidden" })
  }

  const stripe = stripeInstance()
  const account = await stripe.accounts.retrieve(admin.company.stripeAccountId)
  res.status(200).json({ admin, account })
})
