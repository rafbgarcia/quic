import { Business, ExpiresIn, RequestType } from "@prisma/client"
import cuid from "cuid"
import addMinutes from "date-fns/addMinutes"
import { customAlphabet } from "nanoid"
import { amountHelperTxt, validateAmount } from "../../../../lib/amount"
import { getLoginSession } from "../../../../lib/api/auth"
import { selectedBusiness } from "../../../../lib/api/business"
import { prisma } from "../../../../lib/api/db"
import { ServerlessFunctionHandler } from "../../../../lib/api/serverlessHandler"
import { stripe } from "../../../../lib/api/stripe"
import { ensureExhaustive } from "../../../../lib/util"

const makeCode = customAlphabet("0123456789", 6)

/**
 * e.g.
 * amount = 12345
 * fee = amount * 0.1 / 100 = 12.345
 * return is 13 (which means 13 cents)
 *
 * @param amount Integer e.g. R$ 123,45 is passed as 12345
 * @returns fee Integer
 */
function quicFee(amount: number) {
  return Math.ceil((amount * 0.1) / 100)
}

function stripeFee(amount: number) {
  return Math.ceil(amount * (3.99 / 100)) + 39
}

function calcExtraFee(extraFee: number | null, amount: number) {
  if (!extraFee || extraFee === 0) {
    return 0
  }
  const feeFloat = extraFee / 100
  return Math.ceil((amount * feeFloat) / 100)
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
    const requestPayment = !!amount

    if (requestedInfo && requestedInfo.every((requestType: RequestType) => !!RequestType[requestType])) {
      return res.status(400).json({ quicError: "Solicitação inválida" })
    } else if (requestPayment && !validateAmount(amount)) {
      return res.status(400).json({ quicError: amountHelperTxt })
    } else if (!Object.keys(ExpiresIn).includes(expiresIn)) {
      return res.status(400).json({ quicError: "Selecione um tempo de expiração para o código" })
    }

    const newCode = makeCode()
    const requestId = cuid()
    const extraFee = business.extraFee
    const request = await prisma.request.create({
      data: {
        id: requestId,
        amount: amount,
        extraFee,
        requestedInfo: requestedInfo,
        businessId: business.id,
        stripePaymentIntentId: requestPayment
          ? (
              await createPaymentIntent(business, amount, extraFee, requestId)
            ).id
          : undefined,
        requestCodeRef: newCode,
        requestCodeExpiresIn: expiresIn,
        requestCode: {
          create: {
            id: newCode,
            expiresAt: makeExpiresAt(expiresIn),
          },
        },
      },
      include: { requestCode: true },
    })

    res.json(request)
  },
})

function createPaymentIntent(business: Business, amount: number, extraFee: number | null, requestId: string) {
  return stripe.paymentIntents.create({
    amount: amount + calcExtraFee(extraFee, amount),
    currency: "brl",
    automatic_payment_methods: { enabled: true },
    on_behalf_of: business.id, // @see https://stripe.com/docs/connect/destination-charges#settlement-merchant
    application_fee_amount: quicFee(amount) + stripeFee(amount),
    transfer_data: { destination: business.id },
    metadata: { requestId },
  })
}
