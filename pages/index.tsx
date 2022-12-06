import Head from "next/head"
import AdminLayout from "../components/AdminLayout"
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

  return {
    props: { admin },
  }
}

export default function Dashboard() {
  return (
    <AdminLayout>
      <Head>
        <title>Dashboard</title>
      </Head>

      <main>
        <a href="/api/stripe/account/createLink">Complete o perfil da sua empresa no Stripe</a>
      </main>
    </AdminLayout>
  )
}
