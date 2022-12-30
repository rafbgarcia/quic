import { Code } from "@prisma/client"
import { isBefore, parseISO } from "date-fns"

export const CodeModule = {
  isExpired(code: Code) {
    if (!code.expiresAt) return false

    return isBefore(parseISO(code.expiresAt as any), new Date())
  },
}
