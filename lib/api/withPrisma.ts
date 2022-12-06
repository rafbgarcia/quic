import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma, PrismaClient } from "@prisma/client"
import { prisma } from "./db"

export type PrismaClientType = PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
>

type Callback = (req: NextApiRequest, res: NextApiResponse, prisma: PrismaClientType) => any

export const withPrisma = (cb: Callback) => {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      await cb(req, res, prisma)
    } catch (e: any) {
      console.error(">>> Handler error", e.message, e.stack)
      res.status(400).json({ quicError: e.message })
    }
  }
}
