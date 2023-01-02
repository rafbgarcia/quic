import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Stripe from "stripe"
import { intlCurrency } from "../../lib/amount"
import { stripe } from "../../lib/api/stripe"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const paymentIntentId = ctx.params?.code as string | undefined
  if (!paymentIntentId) {
    return { notFound: true }
  }

  const pi = await stripe.paymentIntents.retrieve(paymentIntentId)

  return {
    props: { pi },
  }
}

export default function RequestSuccess({ pi }: { pi: Stripe.Response<Stripe.PaymentIntent> }) {
  return (
    <>
      <Head>
        <title>Solicitação concluída</title>
      </Head>
      <main className="p-4">
        <h1 className="text-lg mb-1 truncate">{pi.metadata.businessName}</h1>
        <h3 className="text-md text-gray-500 font-medium mb-6">{pi.metadata.code}</h3>
        <div className="flex items-center gap-2 flex-col mt-20 max-w-md mx-auto text-center">
          <CheckCircleIcon className="w-20 text-green-800" />
          <h1 className="text-2xl">Tudo certo!</h1>
          <p>Recebemos seu pagamento de {intlCurrency(pi.amount_received)}.</p>
          <p>Agradecemos a preferência.</p>
        </div>
      </main>
    </>
  )
}
