import { NextApiRequest, NextApiResponse } from "next"
import { ServerlessFunctionHandler } from "../../../lib/api/serverlessHandler"
import { stripe } from "../../../lib/api/stripe"

export default ServerlessFunctionHandler({
  allowedMethods: ["GET"],
  handler: async function (req: NextApiRequest, res: NextApiResponse) {
    const id = req.query.id as string | undefined
    if (!id) {
      return res.status(404).json({ quicError: "Pagamento inválido" })
    }

    const pi = await stripe.paymentIntents.retrieve(id)
    res.json(pi)
  },
})
