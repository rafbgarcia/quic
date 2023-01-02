import { XCircleIcon } from "@heroicons/react/24/outline"
import { RequestType } from "@prisma/client"
import { Button, Skeleton } from "antd"
import Head from "next/head"
import { useRouter } from "next/router"
import { RequestPayment } from "../../components/[code]/RequestPayment"
import { CodeResponse, useRequestCode } from "../../lib/api"
import { CodeModule } from "../../lib/api/CodeModule"
import { RequestModule } from "../../lib/api/RequestModule"

export default function Code() {
  const router = useRouter()
  const id = router.query.code as string
  const { data: code, isLoading } = useRequestCode(id)

  return (
    <>
      <Head>
        <title>Código {id}</title>
      </Head>
      {isLoading ? <Skeleton className="m-6" /> : <Content code={code!} />}
    </>
  )
}

function Content({ code }: { code: CodeResponse }) {
  if (!code || CodeModule.isExpired(code)) {
    return <InvalidCode />
  }

  return (
    <div className="p-6">
      <h1 className="text-xl">Código {code.id}</h1>
      <h3 className="text-md text-gray-500 font-medium mb-6">{code.request.business.name}</h3>

      {RequestModule.types(code.request).map((type) => {
        if (type === RequestType.payment) {
          return <RequestPayment key={type} request={code.request} />
        } else {
          return <div key={type}></div>
        }
      })}
    </div>
  )
}

function InvalidCode() {
  const router = useRouter()
  const id = router.query.code as string

  return (
    <div className="flex items-center gap-2 flex-col mt-10">
      <XCircleIcon className="w-20 text-red-800" />
      <h1 className="text-2xl">Código inválido</h1>
      <p className="mb-10">O código {id} não existe ou já expirou.</p>
      <Button href="/code" type="primary">
        Digitar outro código
      </Button>
    </div>
  )
}
