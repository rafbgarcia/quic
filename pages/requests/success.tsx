import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { Typography } from "antd"
import Head from "next/head"

export default function RequestSuccess() {
  return (
    <>
      <Head>
        <title>Solicitação concluída</title>
      </Head>
      <div className="flex items-center gap-2 flex-col mt-10">
        <CheckCircleIcon className="w-20 text-green-800" />
        <h1 className="text-2xl">Tudo certo!</h1>
        <p className="mb-10">Tenha um excelente resto de dia</p>
        <Typography.Link href="/requests">Quer digitar outro código?</Typography.Link>
      </div>
    </>
  )
}
