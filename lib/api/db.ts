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
  var prisma: PrismaType | undefined
}

export const prisma = global.prisma || initPrisma()

if (process.env.NODE_ENV !== "production") global.prisma = prisma

function initPrisma() {
  const prisma = new PrismaClient({
    log: ["query"],
  })

  return prisma.$extends({
    client: {
      $transaction(callback) {
        console.log(">>> $transaction")

        return prisma.$transaction(async (tx: any) => {
          console.log(">>> client.$transaction")
          await tx.$exectuteRawUnsafe("SET SESSION inject_retry_errors_enabled=true")
          await tx.$exectuteRawUnsafe("SAVEPOINT cockroach_restart")

          for (let retry = 1; retry <= 10; retry++) {
            try {
              const result = await callback(tx)
              await tx.$executeRawUnsafe("RELEASE SAVEPOINT cockroach_restart")
              return result
            } catch (error: any) {
              const msg = (error.message || "").toLowerCase()
              console.log(`>>> quic transaction error (retry ${retry}):`, error)

              // @see https://www.cockroachlabs.com/docs/v22.1/advanced-client-side-transaction-retries#how-transaction-retries-work
              // step 4.

              if (
                error.code.toString() === "40001" ||
                msg.includes("retry transaction") ||
                msg.includes("restart transaction")
              ) {
                await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT cockroach_restart")

                await new Promise((resolve) => setTimeout(resolve, retry * 100))
                continue
              } else {
                throw error
              }
            }
          }
        })
      },
    },
  })
}
