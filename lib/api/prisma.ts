import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma, PrismaClient } from "@prisma/client"

export type PrismaClientType = PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
>

export const withPrisma = (
  cb: (
    req: NextApiRequest,
    res: NextApiResponse,
    prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >
  ) => any
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const prisma = new PrismaClient()

    try {
      await cb(req, res, prisma)
    } catch (e: any) {
      console.error(">>> Handler error", e.message, e.stack)
      res.status(400).json({ quicError: e.message })
    }
    await prisma.$disconnect()
  }
}
