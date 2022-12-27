import { Head, Html, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <meta
          name="viewport"
          content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <body className="antialiased font-sans bg-gray-200 overflow-hidden m-0">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
