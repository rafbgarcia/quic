import Head from "next/head"
import AdminLayout from "../../components/AdminLayout"
import QRCode from "react-qr-code"
import { Button, Spin } from "antd"
import { useSWRWithToken } from "../../lib/api"

const Content = ({ data }: any) => {
  const amount = Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(data.charge.amount / 100)

  return (
    <>
      <h3>{amount}</h3>
      <Button href={`http://localhost:8000/pay/${data.charge.code}`}>Link</Button>
      <div className="w-4">
        <QRCode
          size={256}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={`http://localhost:8000/pay/${data.charge.code}`}
          viewBox={`0 0 256 256`}
        />
      </div>
    </>
  )
}

export default function ChargesDetails({ code }: { code: string }) {
  const { data } = useSWRWithToken(`/api/charges/${code}`)

  return (
    <>
      <Head>
        <title>Cobrança</title>
      </Head>
      <AdminLayout>{data ? <Content data={data} /> : <Spin />}</AdminLayout>
    </>
  )
}

export async function getServerSideProps(context: any) {
  return {
    props: { code: context.query.code },
  }
}
