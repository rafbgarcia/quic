import { AppProps } from "next/app"
import { ConfigProvider } from "antd"
import ptBR from "antd/locale/pt_BR"
import { Analytics } from "@vercel/analytics/react"

import "../styles/globals.css"
import "antd/dist/reset.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider locale={ptBR}>
      <Component {...pageProps} />
      <Analytics />
    </ConfigProvider>
  )
}
