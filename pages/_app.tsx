import { Analytics } from "@vercel/analytics/react"
import { AppProps } from "next/app"
import "../styles/globals.css"
// import "antd/dist/reset.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
