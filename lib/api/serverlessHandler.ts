import { NextApiHandler } from "next"

export const ServerlessFunctionHandler = function ({
  allowedMethods,
  handler,
}: {
  allowedMethods?: string[]
  handler: NextApiHandler
}) {
  const methods = allowedMethods || ["POST"]

  const functionHandler: NextApiHandler = async function functionHandler(req, res) {
    try {
      if (!methods.includes(req.method!)) {
        return res.status(405).end("Invalid method")
      }
      return await handler(req, res)
    } catch (e: any) {
      const { pathname } = new URL(req.headers.referer!)
      return res.redirect(encodeURI(`${pathname}?message=${e.message || e}`))
    }
  }

  return functionHandler
}
