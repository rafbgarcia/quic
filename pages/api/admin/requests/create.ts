import { ExpiresIn, Request, RequestType } from "@prisma/client"
import { customAlphabet } from "nanoid"
import { amountHelperTxt, validateAmount } from "../../../../lib/amount"
import { getLoginSession } from "../../../../lib/api/auth"
import { selectedBusiness } from "../../../../lib/api/business"
import { prisma } from "../../../../lib/api/db"
import { RequestModule } from "../../../../lib/api/RequestModule"
import { ServerlessFunctionHandler } from "../../../../lib/api/serverlessHandler"

const makeCode = customAlphabet("0123456789", 6)

export default ServerlessFunctionHandler({
  allowedMethods: ["POST"],
  handler: async function (req, res) {
    const admin = (await getLoginSession(req))!.admin
    const business = (await selectedBusiness(admin))!
    const { amount, expiresIn, extraFeePercent } = req.body
    const types = RequestModule.types({ types: req.body.types } as Request)

    if (types.some((type) => !RequestType[type])) {
      return res.status(400).json({ quicError: "Solicitação inválida" })
    } else if (RequestModule.requestsPayment(types) && !validateAmount(amount)) {
      return res.status(400).json({ quicError: amountHelperTxt })
    } else if (!ExpiresIn[expiresIn as ExpiresIn]) {
      return res.status(400).json({ quicError: "Selecione um tempo de expiração para o código" })
    }

    const code = makeCode()
    const request = await prisma.request.create({
      data: {
        code,
        types,
        amount,
        expiresIn,
        extraFeePercent,
        businessId: business.id,
        codeRef: {
          create: {
            id: code,
            expiresAt: RequestModule.expiresAt({ expiresIn } as Request),
          },
        },
      },
    })

    res.json(request)
  },
})
