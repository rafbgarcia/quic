import { ArrowRightOutlined } from "@ant-design/icons"
import { Button, Form, InputNumber } from "antd"
import Head from "next/head"
import { useRouter } from "next/router"

export default function RequestSuccess() {
  const router = useRouter()
  const onFinish = (values: any) => {
    router.push(`/${values.code}`)
  }
  return (
    <>
      <Head>
        <title>Informar um código</title>
      </Head>
      <div className="flex items-center gap-2 flex-col mt-10">
        <h1 className="text-xl mb-5">Digite o código</h1>
        <Form layout="vertical" requiredMark onFinish={onFinish}>
          <Form.Item
            name="code"
            rules={[
              {
                type: "number",
                required: true,
                message: `informe o código`,
              },
            ]}
            validateTrigger="onBlur"
          >
            <InputNumber
              className="w-full"
              type="tel"
              maxLength={12}
              controls={false}
              placeholder="123456"
              formatter={(val) => (val as unknown as string).replace(/[^\d]/g, "")}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block className="items-center flex justify-center">
              Continuar
              <ArrowRightOutlined />
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  )
}
