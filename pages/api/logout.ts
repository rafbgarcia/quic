import { getLoginSession } from "../../lib/api/auth"
import { removeTokenCookie } from "../../lib/api/authCookies"
import { magic } from "../../lib/api/magic"
import { ServerlessFunctionHandler } from "../../lib/api/serverlessHandler"

export default ServerlessFunctionHandler({
  allowedMethods: ["GET"],
  handler: async function logout(req, res) {
    const admin = (await getLoginSession(req))!.admin

    await magic.users.logoutByIssuer(admin.id)
    removeTokenCookie(res)

    res.redirect("/login")
  },
})
