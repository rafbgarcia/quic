import { stripe } from "../../../../lib/api/stripe"
import { withAdmin } from "../../../../lib/api/withAdmin"

export default withAdmin(async function (req, res, admin) {
  const accountLink = await stripe.accountLinks.create({
    account: admin.company.stripeAccountId,
    refresh_url: "http://localhost:8000/",
    return_url: "http://localhost:8000/",
    type: "account_onboarding",
  })

  res.redirect(accountLink.url)
})
