import { PlusOutlined } from "@ant-design/icons"
import { SquaresPlusIcon } from "@heroicons/react/24/outline"
import { Button, Checkbox, Form, InputNumber, Modal, Select } from "antd"
import map from "lodash/map"
import { GetServerSidePropsContext } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"
import Stripe from "stripe"
import AdminLayout from "../../components/AdminLayout"
import { MAX_AMOUNT, MIN_AMOUNT } from "../../lib/amount"
import { createRequest } from "../../lib/api"
import { getLoginSession } from "../../lib/api/auth"
import { selectedBusiness } from "../../lib/api/business"
import { prisma } from "../../lib/api/db"
import { ExpiresIn, EXPIRES_IN_MAP, RequestType, REQUEST_TYPE_MAP } from "../../lib/enums"
import { makeSerializable } from "../../lib/serializable"

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"]

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const admin = (await getLoginSession(req))!.admin
  const business = (await selectedBusiness(admin))!
  const requests = await prisma.request.findMany({
    take: 20,
    where: { businessId: business.id },
  })

  return {
    props: {
      business: makeSerializable(business)!,
      requests: [] || makeSerializable(requests),
    },
  }
}

export default function Dashboard(props: Props) {
  const [selectedRequest, setSelectedRequest] = useState()
  const account = props.business.stripeMeta as unknown as Stripe.Account

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <AdminLayout>
        <main className="relative z-0 flex-1 overflow-y-auto focus:outline-none order-last">
          <article>
            {props.requests.length > 0 ? (
              <RequestDetails selectedRequest={selectedRequest} />
            ) : (
              <RequestEmptyState />
            )}
          </article>
        </main>

        <aside className="w-96 flex-shrink-0 border-r border-gray-200 order-first flex flex-col">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-lg font-medium text-gray-900">Solicitações</h2>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Directory">
            {props.requests.length > 0 ? <Requests {...props} /> : <EmptyState />}
          </nav>
        </aside>
      </AdminLayout>
    </>
  )
}

function Requests({ requests }: Props) {
  /*
  {Object.keys(requests).map((letter) => (
              <div key={letter} className="relative">
                <div className="sticky top-0 z-10 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
                  <h3>{letter}</h3>
                </div>
                <ul role="list" className="relative z-0 divide-y divide-gray-200">
                  {requests[letter].map((person) => (
                    <li key={person.id}>
                      <div className="relative flex items-center space-x-3 px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-pink-500 hover:bg-gray-50">
                        <div className="flex-shrink-0">
                        <div className="min-w-0 flex-1">
                          <a href="#" className="focus:outline-none">
                            <span className="absolute inset-0" aria-hidden="true" />
                            <p className="text-sm font-medium text-gray-900">{person.name}</p>
                            <p className="truncate text-sm text-gray-500">{person.role}</p>
                          </a>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

*/
  return <></>
}

/**
 * Request Details
 */

function RequestDetails() {
  const router = useRouter()
  if (!router.query.id) return null

  return (
    <>
      <div className="mx-auto max-w-5xl px-8">
        <div className="mt-6 min-w-0 flex-1">
          <h3 className="truncate text-2xl font-bold text-gray-900">Solicitação 938172</h3>
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
  const [form] = Form.useForm()
  const requestedInfo = Form.useWatch("requestedInfo", form) || []
  const onFinish = async (values: any) => {
    const request = await createRequest(values)
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
