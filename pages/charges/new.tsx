import { Button, Card, Form, InputNumber } from "antd"
import { GetServerSidePropsContext } from "next"
import Head from "next/head"
import AdminLayout from "../../components/AdminLayout"
import { amountHelperTxt } from "../../lib/amount"
import { getLoginSession } from "../../lib/api/auth"

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const { admin } = (await getLoginSession(req)) || {}

  if (!admin) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    }
  }
  // const account = await stripe.accounts.retrieve(admin.company.stripeAccountId)
  // if (!account.payouts_enabled) {
  //   return {
  //     redirect: {
  //       destination: encodeURI("/?message=A empresa ainda não pode receber pagamentos"),
  //       permanent: false,
  //     },
  //   }
  // }

  return { props: {} }
}

const formatCurrency = (value: string) => {
  let v = parseFloat(value)
  if (Number.isNaN(v)) v = 0

  return (v / 100).toFixed(2).replace(".", ",")
}

export default function ChargesNew() {
  const [form] = Form.useForm()

  return (
    <>
      <Head>
        <title>Nova cobrança</title>
      </Head>
      <AdminLayout pageTitle="Nova cobrança">
        <Card className="max-w-xl mx-auto">
          <form action="/api/charges/create" method="POST">
            <Form form={form} component="div" layout="vertical" requiredMark>
              <Form.Item label="Valor" required help={amountHelperTxt}>
                <InputNumber
                  autoFocus
                  required
                  name="amount"
                  stringMode
                  maxLength={9}
                  min={1}
                  placeholder="39,90"
                  addonBefore="R$"
                  formatter={(val) => formatCurrency(val as unknown as string)}
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" className="mt-5">
                Criar Cobrança
              </Button>
            </Form>
          </form>
        </Card>
      </AdminLayout>
    </>
  )
}
