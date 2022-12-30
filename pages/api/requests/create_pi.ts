import { ExpiresIn, Request } from "@prisma/client"
import { prisma } from "../../../lib/api/db"
import { ServerlessFunctionHandler } from "../../../lib/api/serverlessHandler"
import { stripe } from "../../../lib/api/stripe"

export default ServerlessFunctionHandler({
  allowedMethods: ["POST"],
  handler: async function (req, res) {
    const id = req.body.id as string
    const amount = req.body.amount as number
    const request = await prisma.request.findUnique({ where: { id } })

    if (!request) {
      return res.status(404).json({ quicError: "Not found" })
    }

    const pi = await stripe.paymentIntents.create({
      amount: amount + extraFee(request, amount),
      currency: "brl",
      on_behalf_of: request.businessId,
      application_fee_amount: quicFee(amount) + stripeFee(amount),
      automatic_payment_methods: {
        enabled: true,
      },
      transfer_data: {
        destination: request.businessId,
      },
      metadata: {
        requestId: request.id,
        code: request.code,
        shouldDelete: request.expiresIn === ExpiresIn.never ? "no" : "yes",
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

function extraFee(request: Request, amount: number) {
  if (!request.extraFeePercent) {
    return 0
  }
  const percentFloat = request.extraFeePercent / 100
  return Math.ceil((amount * percentFloat) / 100)
}
