import { GetServerSidePropsContext } from "next"

export function getDomain(req: GetServerSidePropsContext["req"]) {
  return `${req.headers["x-forwarded-proto"]}://${req.headers.host}`
}
