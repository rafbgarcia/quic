import Iron from "@hapi/iron"
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import { SessionAdmin } from "./api/withAdmin"
import { MAX_AGE, setTokenCookie, getTokenCookie } from "./authCookies"

const TOKEN_SECRET = process.env.ENCRYPTION_SECRET!

type SessionType = { admin: SessionAdmin }
export async function setLoginSession(res: NextApiResponse, session: SessionType) {
  const createdAt = Date.now()
  // Create a session object with a max age that we can validate later
  const obj = { ...session, createdAt, maxAge: MAX_AGE }
  const token = await Iron.seal(obj, TOKEN_SECRET, Iron.defaults)

  setTokenCookie(res, token)
}

export async function getLoginSession(
  req: NextApiRequest | GetServerSidePropsContext["req"]
): Promise<SessionType | null> {
  const token = getTokenCookie(req)

  if (!token) return null

  const session = await Iron.unseal(token, TOKEN_SECRET, Iron.defaults)
  const expiresAt = session.createdAt + session.maxAge * 1000

  // Validate the expiration date of the session
  if (Date.now() > expiresAt) {
    throw new Error("Session expired")
  }

  return session
}
