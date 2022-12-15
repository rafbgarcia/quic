import { getLoginSession } from "../../../../lib/api/auth"
import { selectedBusiness } from "../../../../lib/api/business"
import { prisma } from "../../../../lib/api/db"
import { ServerlessFunctionHandler } from "../../../../lib/api/serverlessHandler"

export default ServerlessFunctionHandler({
  allowedMethods: ["GET"],
  handler: async function (req, res) {
    const admin = (await getLoginSession(req))!.admin
    const business = (await selectedBusiness(admin))!
    const requests = await prisma.request.findMany({
      take: 20,
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      include: { requestCode: true },
    })

    res.json(requests)
  },
})
