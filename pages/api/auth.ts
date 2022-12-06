import { Prisma } from "@prisma/client"
import jwt from "jsonwebtoken"
import { getAdmin } from "../../lib/api/admin"
import { stripeInstance } from "../../lib/api/stripe"
import { withPrisma } from "../../lib/api/withPrisma"

export default withPrisma(async function (req, res, prisma) {
  if (req.method !== "POST") {
    return res.status(405).end()
  }

  const stripe = stripeInstance()
  let admin = await getAdmin(req.body.userMetadata.issuer, prisma)

  if (!admin) {
    const account = await stripe.accounts.create({
      type: "standard",
      country: "BR",
      default_currency: "BRL",
      email: req.body.userMetadata.email,
    })
    const validator = Prisma.validator<Prisma.AdminCreateInput>()({
      id: req.body.userMetadata.issuer,
      email: req.body.userMetadata.email,
      phoneNumber: req.body.userMetadata.phoneNumber,
      idToken: req.body.idToken,
      company: {
        create: {
          name: "My Company",
          stripeAccountId: account.id,
        },
      },
    })

    admin = await prisma.admin.create({ data: validator, include: { company: true } })
  }

  const token = jwt.sign({ sub: admin.id }, process.env.ENCRYPTION_SECRET!)

  res.status(200).json({ token })
})
