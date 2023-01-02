import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { Typography } from "antd"
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
      <div className="flex items-center gap-2 flex-col mt-10 max-w-md mx-auto text-center">
        <CheckCircleIcon className="w-20 text-green-800" />
        <h1 className="text-2xl">Tudo certo!</h1>
        <div className="mb-4">
          Pagamento de {intlCurrency(pi.amount_received)} para {pi.metadata.businessName} concluído.
        </div>

        <Typography.Link href="/">Quer digitar outro código?</Typography.Link>
      </div>
    </>
  )
}
