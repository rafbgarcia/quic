import { stripeInstance } from "../../../../lib/api/stripe"
import { NextApiRequest, NextApiResponse } from "next"
import { withAdmin } from "../../../../lib/api/withAdmin"

const stripe = stripeInstance()

export default withAdmin(async function (req, res, admin) {
  const accountLink = await stripe.accountLinks.create({
    account: admin.company.stripeAccountId,
    refresh_url: "http://localhost:8000/",
    return_url: "http://localhost:8000/",
    type: "account_onboarding",
  })

  res.writeHead(302, { Location: accountLink.url })
  res.end()
})
