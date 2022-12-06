import { Button } from "antd"
import Head from "next/head"
import AdminLayout from "../../components/AdminLayout"
import { post, useSWRWithToken } from "../../lib/api"

export default function ChargesNew() {
  // const { data } = useSWRWithToken("/api/admin")

  const createCharge = async () => {
    const data = await post("/api/charges/create", { amount: 1000 })

    if (data.code) {
      window.location.href = `/charges/${data.code}`
    }
  }

  return (
    <AdminLayout>
      <Head>
        <title>Criar cobrança</title>
      </Head>

      <main>
        <Button type="primary" onClick={createCharge}>
          Criar cobrança
        </Button>
      </main>
    </AdminLayout>
  )
}
