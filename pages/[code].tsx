import { LockClosedIcon } from "@heroicons/react/24/outline"
import { RequestType } from "@prisma/client"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Alert, Button, Skeleton, Spin } from "antd"
import { isBefore, parseISO } from "date-fns"
import { GetServerSidePropsContext } from "next"
import Head from "next/head"
import { createContext, useContext, useState } from "react"
import Stripe from "stripe"
import { intlCurrency } from "../lib/amount"
import { RequestCodeResponse, useRequestCode } from "../lib/api"
import { getDomain } from "../lib/api/req"
import { ensureExhaustive } from "../lib/util"

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"]

const Ctx = createContext<RequestCodeResponse>({ requestCode: null, paymentIntent: null })

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  const id = query.code as string
  return { props: { id } }
}

export default function RequestCode({ id }: Props) {
  const { data } = useRequestCode(id)
  if (!data)
    return (
      <div className="p-6">
        <Skeleton />
      </div>
    )

  const { requestCode, paymentIntent } = data
  const expiresAt = parseISO(requestCode?.expiresAt as any)

  if (!requestCode || isBefore(expiresAt, new Date())) {
    return (
      <div className="p-6">
        <h1 className="text-2xl">Código inválido ou expirado</h1>
      </div>
    )
  }
  const account = requestCode.request.business.stripeMeta as unknown as Stripe.Account
  const businessName = account.company?.name || account.business_profile?.name || ""

  return (
    <>
      <Head>
        <title>Pagar</title>
      </Head>
      <div className="p-6">
        <h1 className="text-xl">{businessName}</h1>
        <Ctx.Provider value={{ requestCode, paymentIntent }}>
          {((requestCode?.request?.requestedInfo as RequestType[]) || []).map((requestType) => (
            <RequestInfo type={requestType} />
          ))}
          {!!requestCode.request.amount && <RequestPayment />}
        </Ctx.Provider>
      </div>
    </>
  )
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function RequestPayment() {
  const { paymentIntent } = useContext(Ctx)

  const options: StripeElementsOptions = {
    clientSecret: paymentIntent?.client_secret!,
    locale: "pt-BR",
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  )
}
function RequestInfo({ type }: { type: RequestType }) {
  const { paymentIntent } = useContext(Ctx)

  return <>Em breve</>
  ensureExhaustive(type)
}

const CheckoutForm = () => {
  const { requestCode } = useContext(Ctx)
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [waiting, setWaiting] = useState(false)
  const [ready, setReady] = useState(false)

  if (!stripe || !elements) {
    return <Spin size="large" />
  }

  const amount = intlCurrency(requestCode?.request.amount!)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setWaiting(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${getDomain()}/pay/success`,
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setWaiting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && <Alert className="mb-5" type="info" message={errorMessage} showIcon />}
      <div className="mb-5">
        <PaymentElement onReady={() => setReady(true)} />
      </div>
      <Button
        className="flex items-center justify-center gap-1"
        htmlType="submit"
        size="large"
        type="primary"
        block
        loading={waiting}
        disabled={!stripe || !ready}
        icon={<LockClosedIcon className="w-4" />}
      >
        Pagar {amount}
      </Button>
    </form>
  )
}
