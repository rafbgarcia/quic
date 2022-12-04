import { Admin, Company, Prisma, PrismaClient } from "@prisma/client"
import jwt, { JwtPayload } from "jsonwebtoken"

export type AdminType = Prisma.Prisma__AdminClient<
  | (Admin & {
      company: Company
    })
  | null,
  null
>

export const currentAdmin = (token: string, prisma: PrismaClient) => {
  const decoded = jwt.verify(token, process.env.ENCRYPTION_SECRET!, { ignoreExpiration: true }) as JwtPayload
  return prisma.admin.findUnique({ where: { id: decoded.sub }, include: { company: true } })
}

export const getAdmin = (id: string, prisma: PrismaClient) => {
  return prisma.admin.findUnique({ where: { id }, include: { company: true } })
}
