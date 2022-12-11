import { Admin } from "@prisma/client"
import { prisma } from "./db"

export async function selectedBusiness(admin: Admin) {
  return await prisma.business.findFirst({
    where: { adminId: admin.id },
    orderBy: { selectedAt: "desc" },
  })
}
