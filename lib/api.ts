import { Customer, Request, RequestCode } from "@prisma/client"
import { message } from "antd"
import useSWR from "swr"
import useSWRMutation from "swr/mutation"

/**
 * Requests API
 */

export type RequestsResponse = (Request & {
  requestCode: RequestCode | null
  customer: Customer | null
})[]

export function useRequests() {
  return useSWR<RequestsResponse>("/api/admin/requests", get, {
    keepPreviousData: true,
  })
}

export function useCreateRequest() {
  return useSWRMutation("/api/admin/requests", post("/api/admin/requests/create"))
}

/**
 * Helpers
 */

function post(url: string) {
  return async function (_key: string, { arg }: any) {
    return fetch(url, {
      method: "POST",
      body: JSON.stringify(arg),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .catch((e) => message.info(e.message))
  }
}

function get(...args: [any]) {
  return fetch(...args, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .catch((e) => message.info(e.message))
}

// export function post(path: string, data: any = {}) {
//   return fetch(path, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   })
//     .then((res) => res.json())
//     .catch((e) => message.info(e.message))
// }
