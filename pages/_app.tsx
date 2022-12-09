import { Analytics } from "@vercel/analytics/react"
import { AppProps } from "next/app"

import "antd/dist/reset.css"
import "../styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
