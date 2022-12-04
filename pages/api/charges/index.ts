import { currentAdmin } from "../../../lib/api/admin"
import { withPrisma } from "../../../lib/api/prisma"
import { stripeInstance } from "../../../lib/api/stripe"

const makeCode = () => Math.random().toString().split(".")[1].slice(0, 6)
const quicFee = (amount: number) => {
  const feeFloat = (amount / 100) * (0.39 / 100)
  const feeInt = parseFloat(feeFloat.toFixed(2)) * 100
  return feeInt
}

export default withPrisma(async function (req, res, prisma) {
  const admin = await currentAdmin(req.headers.authorization!, prisma)
  if (!admin || req.method !== "POST") {
    return res.status(403).json({ quicError: "Forbidden" })
  }

  const amount = req.body.amount!

  const stripe = stripeInstance()
  const account = await stripe.accounts.retrieve(admin.company.stripeAccountId)
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: amount,
      currency: "brl",
      application_fee_amount: quicFee(amount),
      automatic_payment_methods: {
        enabled: true,
      },
    },
    {
      stripeAccount: account.id,
    }
  )
  const charge = await prisma.charge.create({
    data: {
      amount,
      companyId: admin.company.id,
      code: makeCode(),
      stripePaymentIntentId: paymentIntent.id,
    },
  })

  res.status(200).json({
    code: charge.code,
    // ephemeralKey: ephemeralKey.secret,
    // customer: customer.id,
  })
})
