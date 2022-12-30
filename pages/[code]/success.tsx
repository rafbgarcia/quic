import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { Typography } from "antd"
import Head from "next/head"
import { useRouter } from "next/router"

export default function RequestSuccess() {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Solicitação concluída</title>
      </Head>
      <div className="flex items-center gap-2 flex-col mt-10 max-w-md mx-auto">
        <CheckCircleIcon className="w-20 text-green-800" />
        <h1 className="text-2xl">Tudo certo!</h1>
        <p className="mb-10">{router.query.msg}</p>
        <Typography.Link href="/code">Quer digitar outro código?</Typography.Link>
      </div>
    </>
  )
}
