import { GetServerSideProps, GetServerSidePropsContext } from "next"
import { Button, Input } from "antd"
import Head from "next/head"
import { useRouter } from "next/router"
import AdminLayout from "../../components/AdminLayout"
import { getLoginSession } from "../../lib/auth"
import { post } from "../../lib/http"
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
    <AdminLayout>
      <Head>
        <title>Criar cobrança</title>
      </Head>

      <main>
        <form action="/api/charges/create" method="POST">
          <Input name="amount" value="10000" />
          <Button htmlType="submit">Criar cobrança</Button>
        </form>
      </main>
    </AdminLayout>
  )
}
