import { useEffect, useState } from "react"

export const useAdmin = () => {
  let t
  if (typeof window !== "undefined") {
    t = window.localStorage.getItem("quicpay:user:token") || undefined
  }

  const [token, setToken] = useState<string | undefined>(t)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setToken(window.localStorage.getItem("quicpay:user:token") || undefined)
    setLoading(false)
  }, [])

  return { loading, token, isLoggedIn: !!token }
}
