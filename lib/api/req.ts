import { GetServerSidePropsContext } from "next"

export function getDomain(req?: GetServerSidePropsContext["req"]) {
  if (typeof window !== undefined) {
    const url = new URL(window.location.href)
    return url.origin
  } else if (req) {
    const scheme = req.headers["x-forwarded-proto"] || "http"
    return `${scheme}://${req.headers.host}`
  } else {
    throw ">>> Impossible to determine domain"
  }
}
