import useSWR from "swr"
import { useAdmin } from "./useAdmin"

export const post = (url: string, data: any = {}) => {
  const token = window.localStorage.getItem("quicpay:user:token")!

  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify(data),
  }).then((res) => res.json())
}

export const useSWRWithToken = (url: string) => {
  const { token } = useAdmin()

  return useSWR([url, token], (url: string, token: string) =>
    fetch(url, { headers: { "Content-Type": "application/json", Authorization: token! } }).then((res) =>
      res.json()
    )
  )
}
