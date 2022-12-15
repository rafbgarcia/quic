import { PlusOutlined } from "@ant-design/icons"
import { SquaresPlusIcon } from "@heroicons/react/24/outline"
import { Request, RequestCode } from "@prisma/client"
import { Button, Checkbox, Form, InputNumber, Modal, Select, Spin } from "antd"
import classNames from "classnames"
import { intlFormatDistance, parseISO } from "date-fns"
import map from "lodash/map"
import { GetServerSidePropsContext } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"
import useSWR from "swr"
import AdminLayout from "../../components/AdminLayout"
import { MAX_AMOUNT, MIN_AMOUNT } from "../../lib/amount"
import { createRequest, fetcher } from "../../lib/api"
import { getLoginSession } from "../../lib/api/auth"
import { selectedBusiness } from "../../lib/api/business"
import { ExpiresIn, EXPIRES_IN_MAP, RequestType, REQUEST_TYPE_MAP } from "../../lib/enums"
import { makeSerializable } from "../../lib/serializable"

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"]

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const admin = (await getLoginSession(req))!.admin
  const business = (await selectedBusiness(admin))!

  return {
    props: {
      business: makeSerializable(business)!,
    },
  }
}

type RequestWithCode = Request & { requestCode: RequestCode | null }

export default function Dashboard(props: Props) {
  const router = useRouter()
  const { data: requests } = useSWR<RequestWithCode[] | undefined>("/api/admin/requests", fetcher)

  let selectedId = router.query.selectedId
  let selectedRequest: RequestWithCode | null = null
  if (requests) {
    selectedId ||= requests[0].id
    selectedRequest = requests.find((req) => req.id === selectedId)!
  }

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <AdminLayout>
        <main className="relative z-0 flex-1 overflow-y-auto focus:outline-none order-last">
          <article>
            {selectedRequest ? <RequestDetails request={selectedRequest} /> : <RequestEmptyState />}
          </article>
        </main>

        <aside className="w-96 flex-shrink-0 border-r border-gray-200 order-first flex flex-col">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-lg font-medium text-gray-900">Solicitações</h2>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Directory">
            {!requests ? (
              <Spin className="ml-6" />
            ) : requests.length > 0 ? (
              <Requests requests={requests} selectedId={selectedId as string} />
            ) : (
              <EmptyState />
            )}
          </nav>
        </aside>
      </AdminLayout>
    </>
  )
}

function Requests({ requests, selectedId }: { requests: RequestWithCode[]; selectedId: string }) {
  const router = useRouter()
  return (
    <ul className="">
      {requests.map((request) => (
        <li
          onClick={() => router.push(`/admin?selectedId=${request.id}`)}
          className={classNames("cursor-pointer border-l-2 border-b border-b-gray-200", {
            "border-l-white": selectedId !== request.id,
            "border-l-blue-700": selectedId === request.id,
          })}
          key={request.id}
        >
          <div className="px-6 py-5 text-sm hover:bg-gray-50">
            <p className="text-gray-900 flex items-center justify-between">
              <span className="font-medium">{request.requestCodeRef}</span>
              <span>{request.complete ? "Completo" : "Pendente"}</span>
            </p>
            <p className="truncate text-gray-500">
              {intlFormatDistance(parseISO(request.createdAt as unknown as string), new Date(), {
                locale: "pt-BR",
              })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * Request Details
 */

function RequestDetails({ request }: { request: Request }) {
  return (
    <>
      <div className="mx-auto max-w-5xl px-8">
        <div className="mt-6 min-w-0 flex-1">
          <h3 className="truncate text-2xl font-bold text-gray-900">Solicitação {request.requestCodeRef}</h3>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-5xl px-8">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2">
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500">Valor</dt>
            <dd className="mt-1 text-sm text-gray-900">R$ 29,00</dd>
          </div>
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500">Valor</dt>
            <dd className="mt-1 text-sm text-gray-900">R$ 29,00</dd>
          </div>
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500">Nome</dt>
            <dd className="mt-1 text-sm text-gray-900">Rafael Garcia</dd>
          </div>
        </dl>
      </div>
    </>
  )
}

/**
 * NewRequest Modal
 */

function formatCurrency(value: string) {
  let v = parseFloat(value)
  if (Number.isNaN(v)) v = 0

  return (v / 100).toFixed(2).replace(".", ",")
}

function NewRequest({ show, setShow }: any) {
  const router = useRouter()
  const [form] = Form.useForm()
  const requestedInfo = Form.useWatch("requestedInfo", form) || []
  const onFinish = async (values: any) => {
    const request = await createRequest(values)
    router.replace(`/admin?selected=${request.id}`)
  }

  const expiresInOpts = map(EXPIRES_IN_MAP, (label, value) => ({ label, value }))

  return (
    <>
      <Modal
        title="O que deseja solicitar?"
        okText="Gerar código"
        cancelText="Cancelar"
        open={show}
        onOk={() => form.submit()}
        onCancel={() => setShow(false)}
        destroyOnClose
      >
        <Form
          form={form}
          onFinish={onFinish}
          name="control-hooks"
          layout="vertical"
          requiredMark
          initialValues={{ requestedInfo: [RequestType.payment], expiresIn: ExpiresIn["15 minutes"] }}
          className="flex justify-between gap-8"
        >
          <div className="w-[50%]">
            <Form.Item
              name="requestedInfo"
              label=""
              rules={[{ type: "array", required: true, message: "Selecione ao menos uma opção" }]}
            >
              <Checkbox.Group className="block">
                {map(REQUEST_TYPE_MAP, (label, value) => (
                  <div key={value}>
                    <Checkbox className="m-0" value={value}>
                      {label}
                    </Checkbox>
                  </div>
                ))}
              </Checkbox.Group>
            </Form.Item>
          </div>
          <div className="w-[50%]">
            {requestedInfo.includes(RequestType.payment) && (
              <Form.Item
                name="amount"
                label="Qual valor?"
                rules={[
                  { type: "number", min: MIN_AMOUNT, message: "valor mínimo: R$ 1,00" },
                  { type: "number", max: MAX_AMOUNT, message: "valor máximo: R$ 1 milhão" },
                ]}
                validateTrigger="onBlur"
              >
                <InputNumber
                  className="w-full"
                  maxLength={9}
                  addonBefore="R$"
                  formatter={(val) => formatCurrency(val as unknown as string)}
                />
              </Form.Item>
            )}

            <Form.Item
              name="expiresIn"
              label="Código expira em"
              required
              requiredMark
              rules={[{ required: true, message: "campo obrigatório" }]}
            >
              <Select options={expiresInOpts} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  )
}

/**
 * Empty states
 */

function EmptyState() {
  const [showNewRequest, setShowNewRequest] = useState(false)

  return (
    <div className="text-center">
      <SquaresPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma solicitação</h3>
      <p className="mt-1 text-sm text-gray-500">Comece criando sua primeira solitição.</p>
      <div className="mt-6">
        <Button onClick={() => setShowNewRequest(true)} icon={<PlusOutlined />} type="primary">
          Nova Solitação
        </Button>
      </div>
      <NewRequest show={showNewRequest} setShow={setShowNewRequest} />
    </div>
  )
}

function RequestEmptyState() {
  return (
    <div className="text-center">
      <p className="mt-6 italic text-sm text-gray-500">Os detalhes da sua solicitação aparecerão aqui</p>
    </div>
  )
}
