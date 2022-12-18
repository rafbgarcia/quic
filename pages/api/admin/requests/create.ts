import { Business, ExpiresIn } from "@prisma/client"
import addMinutes from "date-fns/addMinutes"
import { customAlphabet } from "nanoid"
import { amountHelperTxt, validateAmount } from "../../../../lib/amount"
import { getLoginSession } from "../../../../lib/api/auth"
import { selectedBusiness } from "../../../../lib/api/business"
import { prisma } from "../../../../lib/api/db"
import { ServerlessFunctionHandler } from "../../../../lib/api/serverlessHandler"
import { stripe } from "../../../../lib/api/stripe"
import { RequestType } from "../../../../lib/enums"
import { ensureExhaustive } from "../../../../lib/util"

const makeCode = customAlphabet("0123456789", 6)

function quicFee() {
  // 10 centavinhos :/ =p
  return 10
}

function stripeFee(amount: number) {
  const feeFloat = (amount / 100) * (3.99 / 100) + 0.39
  const feeInt = parseFloat(feeFloat.toFixed(2)) * 100
  return feeInt
}

function makeExpiresAt(expiresIn: ExpiresIn): Date {
  if (expiresIn === ExpiresIn.minutes_15) {
    return addMinutes(new Date(), 15)
  } else if (expiresIn === ExpiresIn.hours_1) {
    return addMinutes(new Date(), 60)
  } else if (expiresIn === ExpiresIn.hours_24) {
    return addMinutes(new Date(), 60 * 24)
  }

  ensureExhaustive(expiresIn)
}

export default ServerlessFunctionHandler({
  allowedMethods: ["POST"],
  handler: async function (req, res) {
    const admin = (await getLoginSession(req))!.admin
    const business = (await selectedBusiness(admin))!
    const { requestedInfo, amount, expiresIn } = req.body
    const requestsPayment = requestedInfo.includes(RequestType.payment)

    if (!Array.isArray(requestedInfo) || requestedInfo.length === 0) {
      return res.json({ quicError: "Selecione ao menos uma solicitação" })
    } else if (!requestedInfo.every((requestType) => Object.keys(RequestType).includes(requestType))) {
      return res.json({ quicError: "Solicitação inválida" })
    } else if (requestsPayment && !validateAmount(amount)) {
      return res.json({ quicError: amountHelperTxt })
    } else if (!Object.keys(ExpiresIn).includes(expiresIn)) {
      return res.json({ quicError: "Selecione um tempo de expiração para o código" })
    }

    const codeDigits = makeCode()
    const request = await prisma.request.create({
      data: {
        amount: amount,
        requestedInfo: requestedInfo,
        businessId: business.id,
        stripePaymentIntentId: requestsPayment ? (await createPaymentIntent(business, amount)).id : undefined,
        requestCodeRef: codeDigits,
        requestCodeExpiresIn: expiresIn,
        requestCode: {
          create: {
            id: codeDigits,
            expiresAt: makeExpiresAt(expiresIn),
          },
        },
      },
      include: { requestCode: true },
    })

    res.json(request)
  },
})

function createPaymentIntent(business: Business, amount: number) {
  return stripe.paymentIntents.create({
    amount,
    currency: "brl",
    automatic_payment_methods: {
      enabled: true,
    },
    on_behalf_of: business.id,
    application_fee_amount: quicFee() + stripeFee(amount),
    transfer_data: {
      destination: business.id,
    },
  })
}
