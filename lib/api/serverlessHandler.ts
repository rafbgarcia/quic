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
      console.error(">>> Handler Error", e)

      const pathname = req.headers.referer ? new URL(req.headers.referer).pathname : "/admin"
      if (req.headers["content-type"]?.includes("json")) {
        return res.status(400).json({ quicError: e.message })
      } else {
        return res.redirect(encodeURI(`${pathname}?message=${e.message || e}`))
      }
    }
  }

  return functionHandler
}
