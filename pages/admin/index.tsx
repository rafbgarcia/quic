import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons"
import { SquaresPlusIcon } from "@heroicons/react/24/outline"
import { Completion, ExpiresIn, RequestType } from "@prisma/client"
import { Button, Checkbox, Form, message, Modal, Select, Spin, Table } from "antd"
import classNames from "classnames"
import { formatDistanceToNowStrict, formatRelative, parseISO } from "date-fns"
import ptBR from "date-fns/locale/pt-BR"
import map from "lodash/map"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"
import AdminLayout from "../../components/AdminLayout"
import { CurrencyInput } from "../../components/CurrencyInput"
import { intlCurrency } from "../../lib/amount"
import { RequestsResponse, useCreateRequest, useRequests } from "../../lib/api"
import { RequestModule } from "../../lib/api/RequestModule"
import { EXPIRES_IN_MAP, REQUEST_TYPE_MAP } from "../../lib/enums"

export default function Dashboard() {
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
            <h2 className="text-lg font-medium text-gray-900">Códigos</h2>
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
  if (request.completions.length > 0) {
    return (
      <span className="flex items-center gap-1 font-medium">
        <CheckCircleOutlined className="text-green-700" /> Completo
      </span>
    )
  }
  if (request.expiresIn === ExpiresIn.never) {
    return (
      <span className="flex items-center gap-1 text-gray-600">
        <ClockCircleOutlined />
        Não expira
      </span>
    )
  }
  if (RequestModule.isExpired(request)) {
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
      Expira em {formatDistanceToNowStrict(RequestModule.expiresAt(request)!, { locale: ptBR })}
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
                  <td className="font-medium w-[30%]">{request.code}</td>
                  <td>
                    <RequestStatus request={request} />
                  </td>
                </tr>
              </tbody>
            </table>
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
          <h3 className="truncate text-2xl font-bold text-gray-900">Código {request.code}</h3>
        </div>
      </div>

      <div className="mt-6 px-8">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Solicitou</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {RequestModule.types(request)
                .map((requestType) => REQUEST_TYPE_MAP[requestType])
                .join(", ")}
            </dd>
          </div>

          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Valor</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {request.amount ? intlCurrency(request.amount) : "Informado pelo cliente"}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Criado</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatRelative(RequestModule.ensureDate(request.createdAt), new Date(), { locale: ptBR })}
              {request.expiresIn !== ExpiresIn.never && (
                <span> (expira após {EXPIRES_IN_MAP[request.expiresIn]})</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="text-sm font-medium text-gray-500 mt-8 mb-2">Conclusões</div>
        <Table
          dataSource={request.completions}
          showHeader={false}
          columns={[
            {
              title: "Data",
              dataIndex: "createdAt",
              key: "createdAt",
              width: "30%",
              render: (date: string) => formatRelative(parseISO(date), new Date(), { locale: ptBR }),
            },
            {
              title: "Dados",
              dataIndex: "id",
              key: "id",
              render: (_id, completion: Completion, _index) => {
                if (RequestModule.requestsPayment(request.types) && completion.amountReceived) {
                  return <>Pagamento: {intlCurrency(completion.amountReceived)}</>
                }
                return "-"
              },
            },
          ]}
        />
      </div>
    </>
  )
}

function RequestTypeDetail({ type, request }: { type: RequestType; request: RequestsResponse[0] }) {
  if (type === RequestType.payment) {
    return
  }
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
  const types = Form.useWatch("types", form) || undefined
  const expiresIn = Form.useWatch("expiresIn", form) as ExpiresIn

  const expiresInOpts = map(EXPIRES_IN_MAP, (label, value) => ({ label, value }))
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
          initialValues={{ types: [RequestType.payment], expiresIn: ExpiresIn.never }}
          className="flex justify-between gap-8"
        >
          <div className="w-[50%]">
            <Form.Item
              name="types"
              rules={[{ type: "array", required: true, message: "selecione uma opção" }]}
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
            <Form.Item
              name="expiresIn"
              label="Código expira em"
              required
              requiredMark
              help={
                RequestModule.requestsPayment(types) &&
                expiresIn === ExpiresIn.never &&
                "O cliente digitará o valor a pagar"
              }
              rules={[{ required: true, message: "campo obrigatório" }]}
            >
              <Select options={expiresInOpts} />
            </Form.Item>
            {RequestModule.requestsPayment(types) && expiresIn !== ExpiresIn.never && <CurrencyInput />}
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
      <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum código</h3>
      <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro código.</p>
      <div className="mt-6">
        <Button onClick={() => setShowNewRequestModal(true)} icon={<PlusOutlined />} type="primary">
          Novo Código
        </Button>
      </div>
    </div>
  )
}

function RequestEmptyState() {
  return (
    <div className="text-center">
      <p className="mt-6 italic text-sm text-gray-500">Os detalhes do código aparecerão aqui</p>
    </div>
  )
}
