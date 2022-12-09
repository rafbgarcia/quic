import { GetServerSidePropsContext } from "next"
import Head from "next/head"
import Stripe from "stripe"
import AdminLayout from "../components/AdminLayout"
import { stripe } from "../lib/api/stripe"
import { getLoginSession } from "../lib/api/auth"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { Button } from "../components/Button"

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

  return {
    props: { account },
  }
}

type Props = {
  // admin: SessionAdmin
  account: Stripe.Response<Stripe.Account>
}

export default function Dashboard({ account }: Props) {
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <AdminLayout pageTitle="Dashboard">
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="grid grid-cols-1 gap-4 lg:col-span-2">
            <section>
              <div className="rounded-lg bg-white shadow min-h-[70vh]">
                <div className="p-6">
                  {/* <h3 className="text-lg">{account.business_profile?.name}</h3> */}

                  {account.details_submitted ? null : (
                    <Link href="/api/stripe/account/createLink">
                      <Button>Complete o perfil da sua empresa no Stripe</Button>
                    </Link>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <section>
              <h3 className="text-md font-semibold mb-4">Pagamentos</h3>
              <table className="w-full divide-y divide-gray-300">
                <colgroup>
                  <col width="100%" />
                  <col width="0%" />
                </colgroup>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                      <td className="whitespace-nowrap p-2 text-sm truncate max-w-0">
                        1x Gasolina Gasolina Gasolina Gasolina Gasolina Gasolina
                      </td>
                      <td className="whitespace-nowrap p-2 text-sm truncate max-w-0 text-right">R$ 10,00</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="whitespace-nowrap p-2 text-sm">Total</td>
                    <td className="whitespace-nowrap p-2 text-sm font-medium text-right">R$ 100,00</td>
                  </tr>
                </tfoot>
              </table>
            </section>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
