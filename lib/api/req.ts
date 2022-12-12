import { GetServerSidePropsContext } from "next"

export function getDomain(req: GetServerSidePropsContext["req"]) {
  const scheme = req.headers["x-forwarded-proto"] || "http"
  return `${scheme}://${req.headers.host}`
}
