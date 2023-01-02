import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { Button, Typography } from "antd"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Stripe from "stripe"
import { intlCurrency } from "../../lib/amount"
import { stripeBusiness } from "../../lib/api/stripe"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const paymentIntentId = ctx.query.payment_intent as string | undefined
  if (!paymentIntentId) {
    return { notFound: true }
  }

  const pi = await stripeBusiness(ctx.params!.code as string).paymentIntents.retrieve(paymentIntentId, {
    expand: ["latest_charge"],
  })

  return {
    props: { pi },
  }
}

export default function RequestSuccess({ pi }: { pi: Stripe.Response<Stripe.PaymentIntent> }) {
  let msg = `Pagamento de ${intlCurrency(pi.amount_received)}`
  if (pi.metadata.businessName) {
    msg += ` para ${pi.metadata.businessName}`
  }
  msg += ` concluído.`

  const charge = pi.latest_charge as Stripe.Charge
  return (
    <>
      <Head>
        <title>Solicitação concluída</title>
      </Head>
      <div className="flex items-center gap-2 flex-col mt-10 max-w-md mx-auto text-center">
        <CheckCircleIcon className="w-20 text-green-800" />
        <h1 className="text-2xl">Tudo certo!</h1>
        <div className="mb-10">
          {msg}
          {charge.receipt_url && (
            <div className="mt-3">
              <Button type="primary" href={charge.receipt_url}>
                Recibo do pagamento
              </Button>
            </div>
          )}
        </div>

        <Typography.Link href="/">Quer digitar outro código?</Typography.Link>
      </div>
    </>
  )
}
