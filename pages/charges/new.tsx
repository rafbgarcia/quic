import { Button, Input } from "antd"
import { GetServerSidePropsContext } from "next"
import Head from "next/head"
import AdminLayout from "../../components/AdminLayout"
import { getLoginSession } from "../../lib/api/auth"
import { stripe } from "../../lib/api/stripe"

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
  const account = await stripe.accounts.retrieve(admin.company.stripeAccountId)
  if (!account.payouts_enabled) {
    return {
      redirect: {
        destination: encodeURI("/?message=A empresa ainda não pode receber pagamentos"),
        permanent: false,
      },
    }
  }

  return { props: {} }
}

export default function ChargesNew() {
  return (
    <>
      <Head>
        <title>Nova cobrança</title>
      </Head>
      <AdminLayout pageTitle="Nova cobrança">
        <form action="/api/charges/create" method="POST">
          <div className="mb-2">
            <Input name="amount" value="10000" className="rounded-lg" />
          </div>
          <Button htmlType="submit" type="primary">
            Criar cobrança
          </Button>
        </form>
      </AdminLayout>
    </>
  )
}
