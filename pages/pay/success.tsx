import { CheckCircleIcon } from "@heroicons/react/24/outline"
import Head from "next/head"

export default function PaySuccess() {
  return (
    <>
      <Head>
        <title>Solicitação concluída</title>
      </Head>
      <div className="flex items-center gap-2 flex-col mt-10">
        <CheckCircleIcon className="w-20 text-green-800" />
        <h1 className="text-2xl">Tudo certo!</h1>
        <p>Tenha um excelente resto de dia</p>
      </div>
    </>
  )
}
