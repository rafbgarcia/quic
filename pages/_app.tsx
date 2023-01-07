import { Analytics } from "@vercel/analytics/react"
import { AppProps } from "next/app"
import Head from "next/head"
import React from "react"
import "../styles/globals.css"
// import "antd/dist/reset.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <React.StrictMode>
        <Component {...pageProps} />
      </React.StrictMode>
      <Analytics />
    </>
  )
}
