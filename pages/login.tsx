import { MailOutlined } from "@ant-design/icons"
import { Alert, Button, Form, Input } from "antd"
import { Magic } from "magic-sdk"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"

export default function Login() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const onSubmit = async (values: any) => {
    const email = values.email.trim()

    if (errorMsg) setErrorMsg("")
    setLoading(true)

    try {
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUB_KEY!, { locale: "pt" })
      const didToken = await magic.auth.loginWithEmailOTP({ email })
      if (!didToken) {
        router.reload()
      } else {
        router.push(`/api/login?didToken=${didToken}`)
      }
    } catch (error: any) {
      console.error("An unexpected error happened occurred:", error)
      setErrorMsg(error.message)
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Log in</title>
      </Head>

      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto h-12 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Your Company"
          />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Acesse sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use apenas seu e-mail para acessar ou criar sua conta.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="max-w-xl mx-auto">
            <Form onFinish={onSubmit} layout="vertical" requiredMark>
              {router.query.message && (
                <Alert message={router.query.message} showIcon type="warning" className="mb-4" />
              )}
              <Form.Item
                label="E-mail"
                name="email"
                rules={[{ required: true, message: "Digite seu e-mail" }]}
              >
                <Input
                  type="email"
                  size="large"
                  autoFocus
                  placeholder="nome@dominio.com"
                  addonBefore={<MailOutlined />}
                />
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
          </div>
        </div>
      </div>
    </>
  )
}
