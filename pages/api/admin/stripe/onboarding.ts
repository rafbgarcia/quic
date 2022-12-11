import { getLoginSession } from "../../../../lib/api/auth"
import { selectedBusiness } from "../../../../lib/api/business"
import { prisma } from "../../../../lib/api/db"
import { ServerlessFunctionHandler } from "../../../../lib/api/serverlessHandler"
import { stripe } from "../../../../lib/api/stripe"

export default ServerlessFunctionHandler({
  allowedMethods: ["GET"],
  handler: async function (req, res) {
    const admin = (await getLoginSession(req))!.admin
    let business = await selectedBusiness(admin)

    if (!business) {
      const account = await stripe.accounts.create({
        type: "standard",
        country: "BR",
        default_currency: "BRL",
        email: admin.email!,
      })
      business = await prisma.business.create({
        data: { id: account.id, adminId: admin.id },
      })
    }

    const accountLink = await stripe.accountLinks.create({
      account: business.id,
      refresh_url: req.headers.referer!,
      return_url: req.headers.referer!,
      type: "account_onboarding",
    })

    res.redirect(accountLink.url)
  },
})