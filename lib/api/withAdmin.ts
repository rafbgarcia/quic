// import { Admin, Business } from "@prisma/client"
// import { NextApiRequest, NextApiResponse } from "next"
// import { getLoginSession } from "./auth"

// export type SessionAdmin = Admin & { businesses: Business[] }
// type Callback = (req: NextApiRequest, res: NextApiResponse, admin: SessionAdmin) => any

// export function withAdmin(cb: Callback) {
//   return async function handler(req: NextApiRequest, res: NextApiResponse) {
//     try {
//       const session = await getLoginSession(req)

//       if (session) {
//         cb(req, res, session.admin)
//       } else {
//         res.status(401).json({ quicError: "Unauthorized" })
//       }
//     } catch (error: any) {
//       console.error(`>>> Handler error: ${error}`)

//       if (error.message === "Session expired") {
//         res.writeHead(302, {
//           Location: encodeURI("/login?message=Sua sessão expirou, por favor faça login novamente"),
//         })
//       } else {
//         res.status(400).json({ quicError: error.message })
//       }
//     }
//   }
// }
