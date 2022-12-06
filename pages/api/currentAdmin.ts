import { stripe } from "../../lib/api/stripe"
import { withAdmin } from "../../lib/api/withAdmin"

export default withAdmin(async function handler(req, res, admin) {
  const account = await stripe.accounts.retrieve(admin.company.stripeAccountId)

  res.status(200).json({ admin: admin, account })
})
