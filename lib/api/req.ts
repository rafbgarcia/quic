export function getDomain(req: any) {
  return `${req.headers["x-forwarded-proto"]}://${req.headers.host}`
}
