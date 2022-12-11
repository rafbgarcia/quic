import { GetServerSidePropsContext } from "next"
import Head from "next/head"
import AdminLayout from "../../components/AdminLayout"
import { getLoginSession } from "../../lib/api/auth"
import { selectedBusiness } from "../../lib/api/business"
import { makeSerializable } from "../../lib/serializable"

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"]

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const admin = (await getLoginSession(req))!.admin
  const business = makeSerializable(await selectedBusiness(admin))

  if (!business) {
    return { redirect: { destination: "/admin/onboarding" }, props: { business } }
  }

  return {
    props: { business },
  }
}

export default function Dashboard({ business }: Props) {
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <AdminLayout pageTitle="Dashboard">
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="grid grid-cols-1 gap-4 lg:col-span-2">
            <section className="rounded-lg bg-white shadow min-h-[70vh] p-6"></section>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <section></section>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
