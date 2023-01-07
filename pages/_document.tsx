import { Head, Html, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <script src="https://js.stripe.com/v3" async></script>
      </Head>
      <body className="antialiased font-sans bg-gray-200 overflow-hidden m-0">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
