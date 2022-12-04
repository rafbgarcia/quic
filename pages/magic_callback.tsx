import Script from "next/script"
import { useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    window.addEventListener("@magic/ready", async (event: any) => {
      const { idToken, userMetadata } = event.detail
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, userMetadata }),
      })
      const data = await response.json()

      if (data.token) {
        window.localStorage.setItem("quicpay:user:token", data.token)
        router.push("/")
      }
    })
  }, [router])

  return (
    <>
      <Head>
        <title>Finalizando login</title>
      </Head>
      <h3>Finalizando login, por favor aguarde...</h3>
      <Script
        src="https://auth.magic.link/pnp/callback"
        data-magic-publishable-api-key={process.env.NEXT_PUBLIC_MAGIC_PUB_KEY!}
      />
    </>
  )
}
