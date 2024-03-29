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
      })

      business = await prisma.business.create({
        data: {
          id: account.id,
          adminId: admin.id,
          name: "Estabelecimento",
        },
      })
    }

    const account = await stripe.accounts.retrieve(business.id)
    await prisma.business.update({
      data: {
        stripeMeta: account as any,
        name: account.business_profile?.name || account.settings?.dashboard.display_name || undefined,
      },
      where: { id: business.id },
    })

    const accountLink = await stripe.accountLinks.create({
      account: business.id,
      refresh_url: req.headers.referer!,
      return_url: req.headers.referer!,
      type: "account_onboarding",
    })

    res.redirect(accountLink.url)
  },
})
