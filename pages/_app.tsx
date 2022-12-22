import { Analytics } from "@vercel/analytics/react"
import { AppProps } from "next/app"
import React from "react"
import "../styles/globals.css"
// import "antd/dist/reset.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <React.StrictMode>
        <Component {...pageProps} />
      </React.StrictMode>
      <Analytics />
    </>
  )
}
