import { loadStripe, Stripe, StripeElementsOptions } from "@stripe/stripe-js"
import Head from "next/head"
import { useStripe, useElements, Elements, PaymentElement } from "@stripe/react-stripe-js"
import { useEffect, useState } from "react"
import { Button, Spin } from "antd"
import { useSWRWithToken } from "../../../lib/http"

const CheckoutForm = ({ charge }: any) => {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [submitted, setSubmitted] = useState(false)

  if (!stripe || !elements) {
    return <Spin size="large" />
  }

  const amount = Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(charge.amount / 100)

  const handleSubmit = async (e: any) => {
    console.log(">> here")

    e.preventDefault()
    setSubmitted(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `http://localhost:8000/pay/${charge.code}/success`,
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setSubmitted(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button htmlType="submit" size="large" type="primary" loading={submitted} disabled={!stripe}>
        Pagar {amount}
      </Button>

      {errorMessage && <div>{errorMessage}</div>}
    </form>
  )
}

const loadAndSetStripe = async (data: any, setStripe: any) => {
  setStripe(
    await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
      stripeAccount: data.charge.company.stripeAccountId,
    })
  )
}

const Content = ({ data }: any) => {
  const [stripe, setStripe] = useState<Stripe | undefined>()

  useEffect(() => {
    loadAndSetStripe(data, setStripe)
  }, [data])

  if (data.quicError) return <p>Cobrança inválida</p>

  const options: StripeElementsOptions = {
    clientSecret: data.paymentIntent.client_secret || undefined,
    locale: "pt-BR",
  }

  if (!stripe) return <Spin />

  return (
    <Elements stripe={stripe || null} options={options}>
      <CheckoutForm charge={data.charge} stripe={stripe} />
    </Elements>
  )
}

export default function PayWithCode({ code }: { code: string }) {
  const { data } = useSWRWithToken(`/api/charges/${code}`)

  return (
    <>
      <Head>
        <title>Pagar</title>
      </Head>
      {data ? <Content data={data} /> : <Spin />}
    </>
  )
}

export async function getServerSideProps(context: any) {
  return {
    props: { code: context.query.code },
  }
}
