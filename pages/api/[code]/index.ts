import { prisma } from "../../../lib/api/db"
import { ServerlessFunctionHandler } from "../../../lib/api/serverlessHandler"

export default ServerlessFunctionHandler({
  allowedMethods: ["GET"],
  handler: async function (req, res) {
    const id = req.query.code as string
    const requestCode = await prisma.code.findUnique({
      where: { id },
      include: { request: { include: { business: true } } },
    })

    res.json(requestCode)
  },
})
