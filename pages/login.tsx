import { Alert, Button } from "antd"
import { Magic } from "magic-sdk"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"

export default function Login() {
  const router = useRouter()
  const queryMsg = router.query.message as string | null
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleClick = async () => {
    if (errorMsg) setErrorMsg("")
    setLoading(true)

    try {
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUB_KEY!, { locale: "pt" })
      const didToken = await magic.auth.loginWithEmailOTP({ email })
      if (!didToken) {
        return router.reload()
      }

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { Authorization: `Bearer ${didToken}` },
      })

      if (res.status === 200) {
        router.push("/")
      } else {
        throw new Error(await res.text())
      }
    } catch (error: any) {
      console.error("An unexpected error happened occurred:", error)
      setErrorMsg(error.message)
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      {queryMsg && <Alert message={queryMsg} type="info" />}
      <input onChange={(e) => setEmail(e.target.value.trim())} />
      <Button loading={loading} onClick={handleClick}>
        Acessar
      </Button>
    </>
  )
}
