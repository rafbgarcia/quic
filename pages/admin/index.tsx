import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons"
import { SquaresPlusIcon } from "@heroicons/react/24/outline"
import { ExpiresIn, RequestType } from "@prisma/client"
import { Button, Checkbox, Form, InputNumber, message, Modal, Select, Spin } from "antd"
import classNames from "classnames"
import { format, formatDistanceToNowStrict, isBefore, parseISO } from "date-fns"
import ptBR from "date-fns/locale/pt-BR"
import map from "lodash/map"
import { GetServerSidePropsContext } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"
import AdminLayout from "../../components/AdminLayout"
import { extraFee, intlCurrency, MAX_AMOUNT, MIN_AMOUNT } from "../../lib/amount"
import { RequestsResponse, useCreateRequest, useRequests } from "../../lib/api"
import { getLoginSession } from "../../lib/api/auth"
import { selectedBusiness } from "../../lib/api/business"
import { EXPIRES_IN_MAP, REQUEST_TYPE_MAP } from "../../lib/enums"
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

export default function Dashboard(props: Props) {
  const router = useRouter()
  const { data: requests } = useRequests()
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)

  let selectedId = router.query.selectedId
  let selectedRequest: RequestsResponse[0] | undefined
  if (requests && requests.length > 0) {
    selectedId ||= requests[0].id
    selectedRequest = requests.find((req) => req.id === selectedId) || requests[0]
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
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Solicitações</h2>
            <Button
              className="flex items-center justify-center"
              onClick={() => setShowNewRequestModal(true)}
              icon={<PlusOutlined />}
              type="primary"
            />
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Directory">
            {!requests ? (
              <Spin className="ml-6" />
            ) : requests.length > 0 ? (
              <Requests requests={requests} selectedId={selectedId as string} />
            ) : (
              <EmptyState setShowNewRequestModal={setShowNewRequestModal} />
            )}
          </nav>
        </aside>
        <NewRequestModal show={showNewRequestModal} setShow={setShowNewRequestModal} />
      </AdminLayout>
    </>
  )
}

function RequestStatus({ request }: { request: RequestsResponse[0] }) {
  if (request.complete) {
    return (
      <span className="flex items-center gap-1 font-medium">
        <CheckCircleOutlined className="text-green-700" /> Completo
      </span>
    )
  }
  if (!request.requestCode || isBefore(parseISO(request.requestCode.expiresAt as any), new Date())) {
    return (
      <span className="flex items-center gap-1 font-medium">
        <CloseCircleOutlined className="text-red-700" />
        Expirado
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-gray-600">
      <ClockCircleOutlined />
      Expira em{" "}
      {formatDistanceToNowStrict(parseISO(request!.requestCode!.expiresAt as any), { locale: ptBR })}
    </span>
  )
}

function Requests({ requests, selectedId }: { requests: RequestsResponse; selectedId: string }) {
  const router = useRouter()
  return (
    <ul>
      {requests.map((request) => (
        <li
          onClick={() => router.push(`/admin?selectedId=${request.id}`)}
          className={classNames("cursor-pointer border-l-2 border-b border-b-gray-200", {
            "border-l-white hover:bg-gray-50": selectedId !== request.id,
            "border-l-blue-700 bg-gray-100": selectedId === request.id,
          })}
          key={request.id}
        >
          <div className="px-6 py-5 text-sm">
            <table className="text-gray-900" width="100%">
              <tbody>
                <tr>
                  <td className="font-medium w-[30%]">{request.requestCodeRef}</td>
                  <td>{format(parseISO(request.createdAt as any), `HH:mm'h'`)}</td>
                  <td className="w-[50%]">
                    <RequestStatus request={request} />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className=" flex items-center justify-between">
              <span className="text-gray-500">
                {((request!.requestedInfo as RequestType[]) || [])
                  .map((requestType) => REQUEST_TYPE_MAP[requestType])
                  .join(", ")}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * Request Details
 */

function RequestDetails({ request }: { request: RequestsResponse[0] }) {
  return (
    <>
      <div className="mx-auto max-w-5xl px-8">
        <div className="mt-6 min-w-0 flex-1">
          <h3 className="truncate text-2xl font-bold text-gray-900">Solicitação {request.requestCodeRef}</h3>
        </div>
      </div>

      <table className="w-96 mt-6 px-8">
        <tbody>
          {request.amount && (
            <>
              <tr>
                <td className="text-sm font-medium text-gray-500 w-[30%]">Subtotal</td>
                <td className="mb-1 text-sm text-gray-900 text-right">{intlCurrency(request.amount)}</td>
              </tr>
              <tr>
                <td className="text-sm font-medium text-gray-500 w-[30%]">
                  Taxa ({(request?.extraFee || 0) / 100}%)
                </td>
                <td className="mb-1 text-sm text-gray-900 text-right">{intlCurrency(extraFee(request))}</td>
              </tr>
              <tr>
                <td className="text-sm font-medium text-gray-500 w-[30%]">Total</td>
                <td className="mb-1 text-sm text-gray-900 text-right">
                  {intlCurrency(request.amount + extraFee(request))}
                </td>
              </tr>
            </>
          )}
          {((request.requestedInfo as RequestType[]) || []).map((requestType) => (
            <tr key={requestType}>
              <td className="text-sm font-medium text-gray-500 w-[30%]">{REQUEST_TYPE_MAP[requestType]}</td>
              <td className="mb-1 text-sm text-gray-900 text-right">
                <RequestTypeDetail type={requestType} request={request} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

function RequestTypeDetail({ type, request }: { type: RequestType; request: RequestsResponse[0] }) {
  return <>Em breve</>
  // ensureExhaustive(type)
}

/**
 * NewRequest Modal
 */

function formatCurrency(value: string) {
  let v = parseFloat(value)
  if (Number.isNaN(v)) return ""

  return (v / 100).toFixed(2).replace(".", ",")
}

function NewRequestModal({ show, setShow }: any) {
  const { trigger, isMutating } = useCreateRequest()
  const router = useRouter()
  const [form] = Form.useForm()

  const requestPayment = Form.useWatch("requestPayment", form) || false
  const onFinish = async (values: any) => {
    const request = await trigger(values)
    if (request.quicError) {
      message.error(request.quicError)
    } else {
      router.replace(`/admin?selectedId=${request.id}`)
      form.resetFields()
      setShow(false)
    }
  }
  const expiresInOpts = map(EXPIRES_IN_MAP, (label, value) => ({ label, value }))

  return (
    <>
      <Modal
        title="O que deseja solicitar?"
        okText="Gerar código"
        cancelText="Cancelar"
        open={show}
        okButtonProps={{ loading: isMutating }}
        onOk={() => form.submit()}
        onCancel={() => setShow(false)}
        destroyOnClose
      >
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          requiredMark
          initialValues={{ requestPayment: true, expiresIn: ExpiresIn.minutes_15 }}
          className="flex justify-between gap-8"
        >
          <div className="w-[50%]">
            <Form.Item valuePropName="checked" name="requestPayment" noStyle>
              <Checkbox>Pagamento</Checkbox>
            </Form.Item>
            <Form.Item name="requestedInfo" noStyle>
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
            {requestPayment && (
              <Form.Item
                name="amount"
                label="Qual valor?"
                rules={[
                  {
                    type: "number",
                    required: true,
                    message: `informe um valor ou desmarque a opção de "Pagamento"`,
                  },
                  { type: "number", min: MIN_AMOUNT, message: "valor mínimo: R$ 1,00" },
                  { type: "number", max: MAX_AMOUNT, message: "valor máximo: R$ 1 milhão" },
                ]}
                validateTrigger="onBlur"
              >
                <InputNumber
                  className="w-full"
                  maxLength={9}
                  addonBefore="R$"
                  placeholder="49,90"
                  controls={false}
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

function EmptyState({ setShowNewRequestModal }: { setShowNewRequestModal: (val: boolean) => any }) {
  return (
    <div className="text-center">
      <SquaresPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma solicitação</h3>
      <p className="mt-1 text-sm text-gray-500">Comece criando sua primeira solitição.</p>
      <div className="mt-6">
        <Button onClick={() => setShowNewRequestModal(true)} icon={<PlusOutlined />} type="primary">
          Nova Solitação
        </Button>
      </div>
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
