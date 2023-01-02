import { ExpiresIn } from "@prisma/client"
import { prisma } from "../../../lib/api/db"
import { ServerlessFunctionHandler } from "../../../lib/api/serverlessHandler"
import { stripeBusiness } from "../../../lib/api/stripe"

export default ServerlessFunctionHandler({
  allowedMethods: ["POST"],
  handler: async function (req, res) {
    const id = req.body.id as string
    const amount = req.body.amount as number
    const request = await prisma.request.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        expiresIn: true,
        extraFeePercent: true,
        business: { select: { id: true, name: true } },
      },
    })

    if (!request) {
      return res.status(404).json({ quicError: "Not found" })
    }

    const pi = await stripeBusiness(request.business.id).paymentIntents.create({
      amount: amount + extraFee(request.extraFeePercent, amount),
      currency: "brl",
      application_fee_amount: quicFee(amount),
      payment_method_types: ["card", "pix"],
      metadata: {
        requestId: request.id,
        code: request.code,
        shouldDelete: request.expiresIn === ExpiresIn.never ? "no" : "yes",
        businessName: request.business.name,
      },
    })

    res.json(pi)
  },
})

function quicFee(amount: number) {
  return Math.max(10, Math.ceil((amount * 0.1) / 100))
}

function stripeFee(amount: number) {
  return Math.ceil(amount * (3.99 / 100)) + 39
}

function extraFee(extraFeePercent: number | null, amount: number) {
  if (!extraFeePercent) {
    return 0
  }
  const percentFloat = extraFeePercent / 100
  return Math.ceil((amount * percentFloat) / 100)
}
