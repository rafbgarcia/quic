import { PaymentMethod } from "@prisma/client"

export const PaymentMethodModule = {
  isCard(paymentMethod: PaymentMethod) {
    return paymentMethod === PaymentMethod.applePay || paymentMethod === PaymentMethod.googlePay
  },
  stripePaymentMethodType(paymentMethod: PaymentMethod) {
    if (paymentMethod === PaymentMethod.pix) {
      return "pix"
    } else if (PaymentMethodModule.isCard(paymentMethod)) {
      return "card"
    }
    throw new Error(`Método de pagamento inválido: ${paymentMethod}`)
  },
}
