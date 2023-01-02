import { Request } from "@prisma/client"

export const MIN_AMOUNT = 1_00
export const MAX_AMOUNT = 25000_00
const MIN_AMOUNT_MSG = intlCurrency(MIN_AMOUNT)
const MAX_AMOUNT_MSG = intlCurrency(MAX_AMOUNT)

export const amountHelperTxt = `Valor deve ser entre ${MIN_AMOUNT_MSG} e ${MAX_AMOUNT_MSG}`

export function validateAmount(amount: number | undefined) {
  return !amount || (amount >= MIN_AMOUNT && amount <= MAX_AMOUNT)
}

export function parseAmount(amount: string) {
  return parseInt(amount.replace(",", ""), 10)
}

export function intlCurrency(amount: number) {
  return Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount / 100)
}

export function extraFee(request: Request) {
  if (!request.extraFeePercent) {
    return 0
  }
  const feeFloat = request.extraFeePercent / 100
  return Math.ceil((request.amount! * feeFloat) / 100)
}
