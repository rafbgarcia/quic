import { NextApiRequest, NextApiResponse } from "next"
import { removeTokenCookie } from "../../lib/authCookies"
import { getLoginSession } from "../../lib/auth"
import { magic } from "../../lib/api/magic"

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
