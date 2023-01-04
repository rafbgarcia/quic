import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { Skeleton } from "antd"
import Head from "next/head"
import { useRouter } from "next/router"
import { intlCurrency } from "../../lib/amount"
import { usePi } from "../../lib/api"

export default function RequestSuccess() {
  const router = useRouter()
  const id = router.query?.code as string | undefined
  const { data: pi } = usePi(id)

  if (!pi) return <Skeleton className="m-4" />
  if ((pi as any).quicError) return <>Pagamento inválido</>

  return (
    <>
      <Head>
        <title>Solicitação concluída</title>
      </Head>
      <main className="p-4">
        <h1 className="text-lg mb-1 truncate">{pi.metadata.businessName}</h1>
        <h3 className="text-md text-gray-500 font-medium mb-6">{pi.metadata.code}</h3>
        <div className="flex items-center gap-2 flex-col mt-20 max-w-md mx-auto text-center">
          <CheckCircleIcon className="w-20 text-green-800" />
          <h1 className="text-2xl">Tudo certo!</h1>
          <p>Recebemos seu pagamento de {intlCurrency(pi.amount_received)}.</p>
          <p>Agradecemos a preferência.</p>
        </div>
      </main>
    </>
  )
}
