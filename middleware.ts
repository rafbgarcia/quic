/**
 * Authentication Middleware
 *
 * @see https://vercel.com/docs/concepts/functions/edge-middleware/quickstart
 *
 */

import { NextMiddleware, NextResponse } from "next/server"
import { sessionExists } from "./lib/api/authCookies"

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}

export const middleware: NextMiddleware = async function (req) {
  // IBAN country code
  // @see https://www.iban.com/country-codes
  const country = req.geo?.country || "BRA"

  if (country !== "BRA") {
    return NextResponse.redirect("/")
  }

  if (sessionExists(req)) {
    return NextResponse.next()
  } else {
    const url = req.nextUrl
    url.pathname = "/login"
    if (url.pathname.includes("logout")) {
      return NextResponse.redirect(url)
    } else {
      return NextResponse.rewrite(url)
    }
  }
}
