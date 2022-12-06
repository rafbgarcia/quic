import { Prisma } from "@prisma/client"
import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../lib/api/db"
import { magic } from "../../lib/api/magic"
import { stripe } from "../../lib/api/stripe"
import { setLoginSession } from "../../lib/auth"

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()
  if (!req.headers.authorization) throw "Authorization header is required"

  const didToken = magic.utils.parseAuthorizationHeader(req.headers.authorization)
  const meta = await magic.users.getMetadataByToken(didToken)

  let admin = await prisma.admin.findUnique({
    where: { id: meta.issuer! },
    include: { company: true },
  })

  if (!admin) {
    const account = await stripe.accounts.create({
      type: "standard",
      country: "BR",
      default_currency: "BRL",
      email: meta.email!,
    })
    const validator = Prisma.validator<Prisma.AdminCreateInput>()({
      id: meta.issuer!,
      email: meta.email!,
      didToken: didToken,
      company: {
        create: {
          name: "Minha Empresa",
          stripeAccountId: account.id,
        },
      },
    })

    admin = await prisma.admin.create({
      data: validator,
      include: { company: true },
    })
  }

  await setLoginSession(res, { admin })
  res.status(200).end()
}
