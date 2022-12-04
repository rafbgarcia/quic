import Head from "next/head"
import Script from "next/script"

export default function Login() {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <Script
        src="https://auth.magic.link/pnp/login"
        data-magic-publishable-api-key={process.env.NEXT_PUBLIC_MAGIC_PUB_KEY!}
        data-terms-of-service-uri="/path/to/your/terms-of-service"
        data-privacy-policy-uri="/path/to/your/privacy-policy"
        data-redirect-uri="/magic_callback"
        data-locale="pt"
      />
    </>
  )
}
