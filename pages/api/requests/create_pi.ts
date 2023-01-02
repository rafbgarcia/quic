import { ExpiresIn, PaymentMethod } from "@prisma/client"
import { prisma } from "../../../lib/api/db"
import { PaymentMethodModule } from "../../../lib/api/PaymentMethodModule"
import { ServerlessFunctionHandler } from "../../../lib/api/serverlessHandler"
import { stripe } from "../../../lib/api/stripe"

export default ServerlessFunctionHandler({
  allowedMethods: ["POST"],
  handler: async function (req, res) {
    const id = req.body.id as string
    const paymentMethod = req.body.paymentMethod as PaymentMethod
    let amount = req.body.amount as number
    const request = await prisma.request.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        amount: true,
        expiresIn: true,
        extraFeePercent: true,
        business: { select: { id: true, name: true } },
      },
    })

    if (!request || !PaymentMethod[paymentMethod]) {
      return res.status(404).json({ quicError: "Not found" })
    }

    if (request.expiresIn !== ExpiresIn.never) {
      amount = request.amount!
    }

    const pi = await stripe.paymentIntents.create({
      amount: amount + extraFee(request.extraFeePercent, amount, paymentMethod),
      currency: "brl",
      application_fee_amount: stripeFee(paymentMethod, amount),
      payment_method_types: [PaymentMethodModule.stripePaymentMethodType(paymentMethod)],
      statement_descriptor: request.business.name,
      statement_descriptor_suffix: request.business.name,
      transfer_data: {
        destination: request.business.id,
      },
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

function stripeFee(paymentMethod: PaymentMethod, amount: number) {
  if (paymentMethod === PaymentMethod.pix) {
    return Math.ceil(amount * (1.2 / 100))
  } else if (PaymentMethodModule.isCard(paymentMethod)) {
    return Math.ceil(amount * (4 / 100)) + 40
  }
  throw new Error(`Metodo invalido ${paymentMethod}`)
}

function extraFee(extraFeePercent: number | null, amount: number, paymentMethod: PaymentMethod) {
  if (extraFeePercent && PaymentMethodModule.isCard(paymentMethod)) {
    const percentFloat = extraFeePercent / 100
    return Math.ceil((amount * percentFloat) / 100)
  }
  return 0
}
