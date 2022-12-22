import { Business, Customer, Request, RequestCode } from "@prisma/client"
import { message } from "antd"
import Stripe from "stripe"
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
 * RequestCode API
 */

export type RequestCodeResponse = {
  requestCode:
    | (RequestCode & {
        request: Request & {
          business: Business
        }
      })
    | null
  paymentIntent: null | Stripe.PaymentIntent
}

export function useRequestCode(id: string) {
  return useSWR<RequestCodeResponse>(`/api/requestCodes/${id}`, get)
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
