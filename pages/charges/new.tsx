import { GetServerSideProps, GetServerSidePropsContext } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import AdminLayout from "../../components/AdminLayout"
import { getLoginSession } from "../../lib/api/auth"
import { post } from "../../lib/http"
import { stripe } from "../../lib/api/stripe"
import { Button } from "../../components/Button"

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
            <input type="text" name="amount" value="10000" className="rounded-lg" />
          </div>
          <Button type="submit" size="xl">
            Criar cobrança
          </Button>
        </form>
      </AdminLayout>
    </>
  )
}
