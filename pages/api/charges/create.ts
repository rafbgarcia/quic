import { amountHelperTxt, parseAmount, validateAmount } from "../../../lib/amount"
import { prisma } from "../../../lib/api/db"
import { stripe } from "../../../lib/api/stripe"
import { withAdmin } from "../../../lib/api/withAdmin"

const makeCode = () => Math.random().toString().split(".")[1].slice(0, 6)
const quicFee = (amount: number) => {
  const feeFloat = (amount / 100) * (0.19 / 100)
  const feeInt = parseFloat(feeFloat.toFixed(2)) * 100
  return feeInt
}
const stripeFee = (amount: number) => {
  const feeFloat = (amount / 100) * (3.99 / 100) + 0.39
  const feeInt = parseFloat(feeFloat.toFixed(2)) * 100
  return feeInt
}

export default withAdmin(async function (req, res, admin) {
  if (req.method !== "POST") {
    return res.status(404).end()
  }

  const amount = parseAmount(req.body.amount!)

  if (!validateAmount(amount)) {
    return res.redirect(encodeURI(`/charges/new?message=${amountHelperTxt}`))
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "brl",
      automatic_payment_methods: {
        enabled: true,
      },
      // Não sei se devo usar isso.
      // Na doc da Stripe tem falando que se usar, a taxa aplicada
      // é da empresa e não da plataforma.
      //
      // on_behalf_of: admin.company.stripeAccountId,
      application_fee_amount: quicFee(amount) + stripeFee(amount),
      transfer_data: {
        destination: admin.company.stripeAccountId,
      },
    })

    const charge = await prisma.charge.create({
      data: {
        amount,
        companyId: admin.company.id,
        code: makeCode(),
        stripePaymentIntentId: paymentIntent.id,
      },
    })

    res.redirect(`/charges/${charge.code}`)
  } catch (e: any) {
    return res.redirect(encodeURI(`/charges/new?message=${e.message}`))
  }
})
