import { PaymentMethod } from "@prisma/client"

export const PaymentMethodModule = {
  isCard(paymentMethod: PaymentMethod) {
    return (
      paymentMethod === PaymentMethod.applePay ||
      paymentMethod === PaymentMethod.googlePay ||
      paymentMethod === PaymentMethod.card
    )
  },
  stripePaymentMethodType(paymentMethod: PaymentMethod) {
    if (paymentMethod === PaymentMethod.pix) {
      return PaymentMethod.pix
    } else if (PaymentMethodModule.isCard(paymentMethod)) {
      return PaymentMethod.card
    }
    throw new Error(`Método de pagamento inválido: ${paymentMethod}`)
  },
}
