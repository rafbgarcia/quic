import { ExpiresIn, Prisma, Request, RequestType } from "@prisma/client"
import { addMinutes, isBefore, parseISO } from "date-fns"
import { ensureExhaustive } from "../util"

export const RequestModule = {
  types(request: Request) {
    return (request.types || []) as RequestType[]
  },
  requestsPayment(types: Prisma.JsonValue | string[] | undefined) {
    if (!types) return false

    return ((types || []) as RequestType[]).includes(RequestType.payment)
  },
  extraFeePercent(request?: Request) {
    return (request?.extraFeePercent || 0) / 100
  },
  expiresAt(request: Request) {
    const createdAt = request.createdAt ? RequestModule.ensureDate(request.createdAt) : new Date()

    if (request.expiresIn === ExpiresIn.minutes_15) {
      return addMinutes(createdAt, 15)
    } else if (request.expiresIn === ExpiresIn.hours_1) {
      return addMinutes(createdAt, 60)
    } else if (request.expiresIn === ExpiresIn.hours_24) {
      return addMinutes(createdAt, 60 * 24)
    } else if (request.expiresIn === ExpiresIn.never) {
      return undefined
    }

    ensureExhaustive(request.expiresIn)
  },
  isExpired(request: Request) {
    if (request.expiresIn === ExpiresIn.never) return false

    return isBefore(RequestModule.expiresAt(request)!, new Date())
  },
  needsPaymentAmount(request: Request) {
    return (
      request.expiresIn === ExpiresIn.never && RequestModule.requestsPayment(request.types) && !request.amount
    )
  },
  ensureDate(date: string | Date) {
    if (typeof date === "string") {
      return parseISO(date)
    }
    return date
  },
}
