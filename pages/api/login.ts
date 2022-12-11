import { Admin, Prisma } from "@prisma/client"
import { setLoginSession } from "../../lib/api/auth"
import { prisma } from "../../lib/api/db"
import { magic } from "../../lib/api/magic"
import { ServerlessFunctionHandler } from "../../lib/api/serverlessHandler"

export default ServerlessFunctionHandler({
  allowedMethods: ["GET"],
  handler: async function login(req, res) {
    const didToken = req.query.didToken as string | undefined
    if (!didToken) return res.redirect("/login")

    const meta = await magic.users.getMetadataByToken(didToken)
    console.log(meta)
    let admin = await prisma.admin.findUnique({ where: { id: meta.issuer! } })
    if (!admin) {
      admin = await prisma.admin.create({
        data: Prisma.validator<Prisma.AdminCreateInput>()({
          id: meta.issuer!,
          magicMeta: meta,
        }),
      })
    }

    await setLoginSession(res, { admin })

    if (await needsOnboarding(admin)) {
      return res.status(200).redirect("/admin/onboarding")
    }

    const url = new URL(req.headers.referer!)

    if (url.pathname === "/login") {
      res.status(200).redirect("/admin")
    } else {
      res.status(200).redirect(url.toString())
    }
  },
})

async function needsOnboarding(admin: Admin) {
  const businessesCount = await prisma.business.count({ where: { adminId: admin.id } })
  return businessesCount === 0
}
