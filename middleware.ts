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
  const url = req.nextUrl
  console.log(country, req.geo)

  if (country !== "BRA") {
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  if (sessionExists(req)) {
    return NextResponse.next()
  } else {
    url.pathname = "/login"
    return NextResponse.rewrite(url)
  }
}

/*
const netStripeFee = (amount: number) => {
  const customerPays = amount + (amount * 1.99) / 100
  const stripeFee = (customerPays * 3.99) / 100 + 0.39
  const businessReceivesAmount = customerPays - stripeFee
  const netFee = (1 - businessReceivesAmount / amount) * 100
  return [netFee, businessReceivesAmount]
}

console.log(netStripeFee(10))
console.log(netStripeFee(20))
console.log(netStripeFee(30))
console.log(netStripeFee(40))
console.log(netStripeFee(50))
console.log(netStripeFee(100))
console.log(netStripeFee(200))
console.log(netStripeFee(300))
console.log(netStripeFee(400))
console.log(netStripeFee(500))
console.log(netStripeFee(1000))
*/
