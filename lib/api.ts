import { Business, Code, Completion, Prisma, Request } from "@prisma/client"
import { message } from "antd"
import Stripe from "stripe"
import useSWRImmutable from "swr/immutable"
import useSWRMutation from "swr/mutation"

/**
 * Requests API
 */

export type RequestsResponse = (Request & {
  completions: Completion[]
})[]

export function useRequests() {
  return useSWRImmutable<RequestsResponse>(`/api/admin/requests`, get, {
    refreshInterval: 10000,
    keepPreviousData: true,
  })
}

export function useCreateRequest() {
  return useSWRMutation("/api/admin/requests", swrPost("/api/admin/requests/create"))
}

/**
 * Code API
 */

export type CodeResponse =
  | (Code & {
      request: Request & {
        business: Business
      }
    })
  | null

export function useRequestCode(id: string) {
  return useSWRImmutable<CodeResponse>(`/api/${id}`, get)
}

/**
 * PaymentIntent
 */

export type PiResponse = Stripe.Response<Stripe.PaymentIntent>

export function usePi(id: string | undefined) {
  return useSWRImmutable<PiResponse>(`/api/stripe/pi?id=${id}`, get)
}

/**
 * Helpers
 */

export function post(url: string, data: Prisma.JsonValue | undefined = undefined) {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .catch((e) => message.info(e.message))
}

export function get(...args: [any]) {
  return fetch(...args, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .catch((e) => message.info(e.message))
}

function swrPost(url: string) {
  return async function (_key: string, { arg }: any) {
    return post(url, arg)
  }
}
