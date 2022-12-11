import { Charge } from "@prisma/client"
import { Card } from "antd"
import { GetServerSidePropsContext } from "next"
import Head from "next/head"
import QRCode from "react-qr-code"
import AdminLayout from "../../../components/AdminLayout"
import { intlCurrency } from "../../../lib/amount"
import { getLoginSession } from "../../../lib/api/auth"
import { prisma } from "../../../lib/api/db"
import { getDomain } from "../../../lib/api/req"
import { redirectResult } from "../../../lib/nextHelpers"
import { makeSerializable } from "../../../lib/serializable"

export async function getServerSideProps({ req, query, res }: GetServerSidePropsContext) {
  const { admin } = (await getLoginSession(req)) || {}
  if (!admin) return redirectResult("/login", "Sua sessão expirou, por favor refaça login")

  const charge = await prisma.charge.findFirst({
    where: {
      code: query.code as string,
      companyId: admin?.companyId,
    },
  })
  if (!charge) return { notFound: true }

  return { props: { charge: makeSerializable(charge), domain: getDomain(req) } }
}

export default function ChargesDetails({ charge, domain }: { charge: Charge; domain: string }) {
  return (
    <>
      <Head>
        <title>Cobrança {charge.code}</title>
      </Head>
      <AdminLayout pageTitle="Detalhes da Cobrança">
        <Card className="max-w-xl">
          <p>{intlCurrency(charge.amount)}</p>

          <div>
            <p>{charge.code}</p>
            <QRCode size={256} value={`${domain}/pay/${charge.code}`} viewBox={`0 0 256 256`} />
          </div>
        </Card>
      </AdminLayout>
    </>
  )
}
