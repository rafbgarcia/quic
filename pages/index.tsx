import Head from "next/head"
import AdminLayout from "../components/AdminLayout"
import { post, useSWRWithToken } from "../lib/api"

export default function Dashboard() {
  const { data } = useSWRWithToken("/api/admin")

  const redirectToStripe = async () => {
    const data = await post("/api/stripe/account/createLink")
    if (data.url) window.location.href = data.url
  }

  return (
    <AdminLayout>
      <Head>
        <title>Dashboard</title>
        <meta name="viewport" content="width=device-width" />
      </Head>

      <main>
        <p>Nome: {data?.admin?.company?.name}</p>
        <p>Acct: {data?.account?.id}</p>
        <p>
          Aguardando: {(!data?.account?.details_submitted || !data?.account?.charges_enabled)?.toString()}
        </p>
        <p>Ativo: {data?.account?.charges_enabled?.toString()}</p>
        {!data?.account?.details_submitted && (
          <button onClick={redirectToStripe}>Complete o perfil da sua empresa no Stripe</button>
        )}
      </main>
    </AdminLayout>
  )
}
