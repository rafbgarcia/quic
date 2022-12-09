import { NextApiRequest, NextApiResponse } from "next"
import { getLoginSession } from "../../lib/api/auth"
import { magic } from "../../lib/api/magic"
import { removeTokenCookie } from "../../lib/api/authCookies"

export default async function logout(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getLoginSession(req)

    if (session) {
      await magic.users.logoutByIssuer(session.admin.id)
      removeTokenCookie(res)
    }
    res.writeHead(302, { Location: "/" }).end()
  } catch (error: any) {
    console.error(">>> error", error)
    res.end(error.message)
  }
}
