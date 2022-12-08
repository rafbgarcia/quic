import Head from "next/head"
import AdminLayout from "../../components/AdminLayout"
import QRCode from "react-qr-code"
import { GetServerSidePropsContext } from "next"
import { getLoginSession } from "../../lib/auth"
import { prisma } from "../../lib/api/db"
import { Charge } from "@prisma/client"
import { makeSerializable } from "../../lib/serializable"

export async function getServerSideProps({ req, query }: GetServerSidePropsContext) {
  const { admin } = (await getLoginSession(req)) || {}

  if (!admin) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    }
  }

  const charge = await prisma.charge.findFirst({
    where: { code: query.code as string },
  })

  return { props: { charge: makeSerializable(charge) } }
}

export default function ChargesDetails({ charge }: { charge: Charge }) {
  const amount = Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(charge.amount / 100)

  return (
    <>
      <Head>
        <title>Cobrança {charge.code}</title>
      </Head>
      <AdminLayout>
        <p>{amount}</p>

        <div>
          <p>{charge.code}</p>
          <QRCode size={256} value={`http://localhost:8000/pay/${charge.code}`} viewBox={`0 0 256 256`} />
        </div>
      </AdminLayout>
    </>
  )
}
