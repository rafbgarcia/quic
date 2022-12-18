import { Button } from "antd"
import Head from "next/head"
import Link from "next/link"

export default function Home() {
  return (
    <>
      <Head>
        <title>Sobre</title>
      </Head>
      <h1>Sobre</h1>
      <Button>
        <Link href="/admin">Área do parceiro</Link>
      </Button>
    </>
  )
}
