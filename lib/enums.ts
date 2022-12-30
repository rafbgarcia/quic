import { ExpiresIn, RequestType } from "@prisma/client"

/**
 * RequestType
 */

export const REQUEST_TYPE_MAP = {
  payment: "Pagamento",
  fullName: "Nome completo",
  shippingAddress: "Endereço de entrega",
  phoneNumber: "Número de telefone",
  id: "CPF",
  email: "E-mail",
} as const

checkExhaustiveMapping(REQUEST_TYPE_MAP, RequestType)

/**
 * ExpiresIn
 */

export const EXPIRES_IN_MAP = {
  [ExpiresIn.never]: "Nunca expira",
  [ExpiresIn.minutes_15]: "15 minutos",
  [ExpiresIn.hours_1]: "1 hora",
  [ExpiresIn.hours_24]: "24 horas",
} as const

checkExhaustiveMapping(EXPIRES_IN_MAP, ExpiresIn)

/**
 * Helpers
 */
function checkExhaustiveMapping(obj1: Object, obj2: Object) {
  if (Object.keys(obj1).sort().toString() !== Object.keys(obj2).sort().toString()) {
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    const difference = keys1
      .filter((k1) => !keys2.includes(k1))
      .concat(keys2.filter((k2) => !keys1.includes(k2)))

    throw `>>> obj2 must exhaustively map obj1. Different keys: ${difference.toString()}`
  }
}
