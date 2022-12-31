// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

import { PrismaClient } from "@prisma/client"

type PrismaType = ReturnType<typeof initPrisma>

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaType | undefined
}

export const prisma = global.prismaInstance || initPrisma()

if (process.env.NODE_ENV !== "production") global.prismaInstance = prisma

function initPrisma() {
  return new PrismaClient({
    log: ["query"],
  })
}
