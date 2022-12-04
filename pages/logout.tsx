import Script from "next/script"

export default function Logout() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("quicpay:user:token")
  }
  return (
    <Script
      src="https://auth.magic.link/pnp/logout"
      data-magic-publishable-api-key={process.env.NEXT_PUBLIC_MAGIC_PUB_KEY!}
      data-redirect-uri="/login"
    />
  )
}
