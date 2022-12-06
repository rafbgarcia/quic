import Head from "next/head"
import Stripe from "stripe"
import AdminLayout from "../components/AdminLayout"
import { stripe } from "../lib/api/stripe"
import { SessionAdmin } from "../lib/api/withAdmin"
import { getLoginSession } from "../lib/auth"

export async function getServerSideProps({ req, res }: any) {
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

  return {
    props: { admin, account },
  }
}

type Props = {
  admin: SessionAdmin
  account: Stripe.Response<Stripe.Account>
}

export default function Dashboard({ account }: Props) {
  return (
    <AdminLayout>
      <Head>
        <title>Dashboard</title>
      </Head>

      <main>
        <p>{JSON.stringify(account.business_profile)}</p>
        <p>account.details_submitted: {JSON.stringify(account.details_submitted)}</p>
        <p>account.charges_enabled: {JSON.stringify(account.charges_enabled)}</p>

        {account.details_submitted ? null : (
          <a href="/api/stripe/account/createLink">Complete o perfil da sua empresa no Stripe</a>
        )}
      </main>
    </AdminLayout>
  )
}
