import { loadStripe, PaymentRequest, StripeElementsOptions } from "@stripe/stripe-js"
import Head from "next/head"
import {
  useStripe,
  useElements,
  Elements,
  PaymentElement,
  CardElement,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js"
import { useEffect, useState } from "react"
import { Button, Spin } from "antd"
import { GetServerSidePropsContext } from "next"
import { prisma } from "../../../lib/api/db"
import { stripe as stripeApi } from "../../../lib/api/stripe"
import { makeSerializable } from "../../../lib/serializable"
import { getDomain } from "../../../lib/api/req"
import { useRouter } from "next/router"

export async function getServerSideProps({ query, req, ...ctx }: GetServerSidePropsContext) {
  const code = query.code as string
  const charge = makeSerializable(
    await prisma.charge.findFirstOrThrow({ where: { code }, include: { company: true } })
  )
  const paymentIntent = await stripeApi.paymentIntents.retrieve(charge.stripePaymentIntentId)
  const account = await stripeApi.accounts.retrieve(charge.company.stripeAccountId)

  return {
    props: { charge, paymentIntent, account, domain: getDomain(req) },
  }
}

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"]

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PayWithCode(props: Props) {
  const options: StripeElementsOptions = {
    clientSecret: props.paymentIntent.client_secret!,
    locale: "pt-BR",
  }
  const amount = Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(props.charge.amount / 100)

  return (
    <>
      <Head>
        <title>Pagar</title>
      </Head>

      <h3>{amount}</h3>
      <Elements stripe={stripePromise} options={options}>
        <WalletElement {...props} />
        {/* <PaymentElements {...props} /> */}
      </Elements>
    </>
  )
}

const PaymentElements = (props: Props) => {
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
  }).format(props.charge.amount / 100)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setSubmitted(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${props.domain}/pay/${props.charge.code}/success`,
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

const WalletElement = (props: Props) => {
  const router = useRouter()
  const stripe = useStripe()
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null)

  useEffect(() => {
    if (stripe) {
      const paymentRequest = stripe.paymentRequest({
        country: "BR",
        currency: "brl",
        disableWallets: [],
        total: {
          label: props.account.company?.name || props.account.business_profile?.name || "",
          amount: props.charge.amount,
        },
        // requestShipping: true,
        // requestPayerName: true,
        // requestPayerEmail: true,
      })

      paymentRequest.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(paymentRequest)
        }
      })
    }
  }, [stripe])

  if (!paymentRequest || !stripe) return <Spin size="large" />

  paymentRequest.on("paymentmethod", async (e) => {
    // Confirm the PaymentIntent without handling potential next actions (yet).
    const clientSecret = props.paymentIntent.client_secret!
    const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: e.paymentMethod.id },
      { handleActions: false }
    )
    debugger

    if (confirmError) {
      // Report to the browser that the payment failed, prompting it to
      // re-show the payment interface, or show an error message and close
      // the payment interface.
      e.complete("fail")
    } else {
      // Report to the browser that the confirmation was successful, prompting
      // it to close the browser payment method collection interface.
      e.complete("success")
      // Check if the PaymentIntent requires any actions and if so let Stripe.js
      // handle the flow. If using an API version older than "2019-02-11"
      // instead check for: `paymentIntent.status === "requires_source_action"`.
      if (paymentIntent.status === "requires_action") {
        // Let Stripe.js handle the rest of the payment flow.
        const { error } = await stripe.confirmCardPayment(clientSecret)
        if (error) {
          // The payment failed -- ask your customer for a new payment method.
        } else {
          // The payment has succeeded.
          router.push("success")
        }
      } else {
        // The payment has succeeded.
        router.push("success")
      }
    }
  })
  return <PaymentRequestButtonElement options={{ paymentRequest }} />
}
