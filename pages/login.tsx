import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline"
import { Alert, Button, Card, Form, Input } from "antd"
import classnames from "classnames"
import { Magic } from "magic-sdk"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"

export default function Login() {
  const [currentTab, setCurrentTab] = useState(0)

  const router = useRouter()
  const cb = (didToken: string | null) => {
    if (!didToken) {
      router.reload()
    } else {
      router.push(encodeURI(`/api/login?didToken=${didToken}`))
    }
  }

  return (
    <>
      <Head>
        <title>Log in</title>
      </Head>

      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* <Logo className=" mx-auto" /> */}
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Acesse sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Escolha um método para receber o código de acesso.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Tabs current={currentTab} onClick={setCurrentTab} />

          <Card className="mt-4">{currentTab === 0 ? <EmailForm cb={cb} /> : <PhoneForm cb={cb} />}</Card>
        </div>
      </div>
    </>
  )
}

function EmailForm({ cb }: { cb: (didToken: string | null) => void }) {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const loginWithEmail = async (values: any) => {
    const email = values.email.trim()

    if (errorMsg) setErrorMsg("")
    setLoading(true)

    try {
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUB_KEY!, { locale: "pt" })
      const didToken = await magic.auth.loginWithEmailOTP({ email })
      cb(didToken)
    } catch (error: any) {
      console.error("An unexpected error happened occurred:", error)
      setErrorMsg(error.message)
      setLoading(false)
    }
  }

  return (
    <Form onFinish={loginWithEmail} layout="vertical" requiredMark>
      {router.query.message && (
        <Alert message={router.query.message} showIcon type="warning" className="mb-4" />
      )}
      <Form.Item label="E-mail" name="email" rules={[{ required: true, message: "Digite seu e-mail" }]}>
        <Input type="email" size="large" autoFocus placeholder="nome@dominio.com" />
      </Form.Item>

      <Button
        loading={loading}
        type="primary"
        htmlType="submit"
        size="large"
        block
        className="flex justify-center items-center"
      >
        Receber código por e-mail
      </Button>
    </Form>
  )
}

const formatPhoneNumber = (phone: string) => {
  phone = phone.replace(/[^\d]/g, "")
  const [ddd, first, last] = [phone.slice(0, 2), phone.slice(2, 7), phone.slice(7)]

  if (last.length > 0) return `(${ddd}) ${first}-${last}`
  if (first.length > 0) return `(${ddd}) ${first}`
  if (ddd.length > 0) return `(${ddd}`
  return ""
}

function PhoneForm({ cb }: { cb: (didToken: string | null) => void }) {
  const [form] = Form.useForm()
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const loginWithSMS = async (values: any) => {
    const phoneNumber = "+55" + values.phone.replace(/[^\d]/g, "")

    if (errorMsg) setErrorMsg("")
    setLoading(true)

    try {
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUB_KEY!, { locale: "pt" })
      const didToken = await magic.auth.loginWithSMS({ phoneNumber })
      cb(didToken)
    } catch (error: any) {
      console.error(">>> Erro:", error)
      setErrorMsg(error.message)
      setLoading(false)
    }
  }

  return (
    <Form form={form} onFinish={loginWithSMS} layout="vertical" requiredMark>
      {router.query.message && (
        <Alert message={router.query.message} showIcon type="warning" className="mb-4" />
      )}
      <div id="loginPhoneNumber">
        <style>{"#loginPhoneNumber .ant-input-number-handler-wrap{ display: none }"}</style>
        <Form.Item label="Telefone" name="phone" rules={[{ required: true, message: "Digite seu telefone" }]}>
          <Input
            value={"omg"}
            onChange={(e) => form.setFieldsValue({ phone: formatPhoneNumber(e.target.value) })}
            type="tel"
            size="large"
            autoFocus
            placeholder="(11) 91111-2222"
            maxLength={15}
          />
        </Form.Item>
      </div>

      <Button
        loading={loading}
        type="primary"
        htmlType="submit"
        size="large"
        block
        className="flex justify-center items-center"
      >
        Receber código por SMS
      </Button>
    </Form>
  )
}

const tabs = [
  { name: "Receber por E-mail", icon: EnvelopeIcon },
  { name: "Receber por SMS", icon: PhoneIcon },
]

function Tabs({ current, onClick }: any) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex items-center" aria-label="Tabs">
        {tabs.map((tab, i) => (
          <span
            key={tab.name}
            onClick={() => onClick(i)}
            className={classnames(
              i === current
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              "group w-full inline-flex items-center justify-center py-4 px-1 border-b-2 font-medium text-sm cursor-pointer"
            )}
          >
            <tab.icon
              className={classnames(
                tab === current ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500",
                "-ml-0.5 mr-2 h-5 w-5"
              )}
              aria-hidden="true"
            />
            <span>{tab.name}</span>
          </span>
        ))}
      </nav>
    </div>
  )
}
