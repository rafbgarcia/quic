import { parse, serialize } from "cookie"
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import { NextRequest } from "next/server"

const COOKIE_KEY = "quic:token"

export const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function sessionExists(req: NextRequest) {
  return !!req.cookies.get(COOKIE_KEY)?.value
}

export function setTokenCookie(res: NextApiResponse, token: string) {
  const cookie = serialize(COOKIE_KEY, token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  })

  res.setHeader("Set-Cookie", cookie)
}

export function removeTokenCookie(res: NextApiResponse) {
  const cookie = serialize(COOKIE_KEY, "", {
    maxAge: -1,
    path: "/",
  })

  res.setHeader("Set-Cookie", cookie)
}

export function parseCookies(req: NextApiRequest | GetServerSidePropsContext["req"]) {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie
  return parse(cookie || "")
}

export function getTokenCookie(req: NextApiRequest | GetServerSidePropsContext["req"]) {
  const cookies = parseCookies(req)
  return cookies[COOKIE_KEY]
}
