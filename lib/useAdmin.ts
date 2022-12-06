import { useEffect } from "react"
import Router from "next/router"
import useSWR from "swr"
import { Admin, Company } from "@prisma/client"

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((data) => ({ admin: data?.admin }))

export function useAdmin({ redirectTo, redirectIfFound }: any = {}): null | (Admin & { company: Company }) {
  const { data, error } = useSWR("/api/currentAdmin", fetcher)
  const admin = data?.admin
  const finished = Boolean(data)
  const hasAdmin = Boolean(admin)

  useEffect(() => {
    if (!redirectTo || !finished) return
    if (
      // If redirectTo is set, redirect if the admin was not found.
      (redirectTo && !redirectIfFound && !hasAdmin) ||
      // If redirectIfFound is also set, redirect if the admin was found
      (redirectIfFound && hasAdmin)
    ) {
      Router.push(redirectTo)
    }
  }, [redirectTo, redirectIfFound, finished, hasAdmin])

  return error ? null : admin
}
