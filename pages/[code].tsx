import { InfoCircleOutlined } from "@ant-design/icons"
import { LockClosedIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { RequestType } from "@prisma/client"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Alert, Button, Popover, Skeleton, Spin, Typography } from "antd"
import { isBefore, parseISO } from "date-fns"
import { GetServerSidePropsContext } from "next"
import Head from "next/head"
import { createContext, useContext, useState } from "react"
import Stripe from "stripe"
import { extraFee, intlCurrency } from "../lib/amount"
import { RequestCodeResponse, useRequestCode } from "../lib/api"
import { getDomain } from "../lib/api/req"

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
      <>
        <Head>
          <title>Código inválido</title>
        </Head>
        <div className="flex items-center gap-2 flex-col mt-10">
          <XCircleIcon className="w-20 text-red-800" />
          <h1 className="text-2xl">Código inválido</h1>
          <p className="mb-10">O código {id} não existe ou já expirou.</p>
          <Button href="/requests" type="primary">
            Digitar outro código
          </Button>
        </div>
      </>
    )
  }
  const account = requestCode.request.business.stripeMeta as unknown as Stripe.Account

  return (
    <>
      <Head>
        <title>Código {requestCode.id}</title>
      </Head>
      <div className="p-6">
        <h1 className="text-xl">Código {requestCode.id}</h1>
        <h3 className="text-md text-gray-500 font-medium">{requestCode.request.business.name}</h3>

        {requestCode.request.extraFee ? (
          <table className="w-full text-left mt-5">
            <tbody className="divide-y divide-gray-200">
              <tr className="font-medium">
                <td className="whitespace-nowrap text-sm text-gray-600">Subtotal</td>
                <td className="whitespace-nowrap text-sm text-gray-600 text-right">
                  {intlCurrency(requestCode.request.amount!)}
                </td>
              </tr>

              <tr>
                <td className="whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    Taxa do estabelecimento
                    <Popover
                      content={
                        <>
                          <p>Esta taxa não é do Quic.</p>
                          <p>O estabelecimento optou por dividir</p>
                          <p>a taxa da forma de pagamento.</p>
                        </>
                      }
                    >
                      <InfoCircleOutlined />
                    </Popover>
                  </div>
                </td>
                <td className="whitespace-nowrap text-sm text-gray-600 text-right">
                  {intlCurrency(extraFee(requestCode.request))}
                </td>
              </tr>
              <tr>
                <th className="text-sm font-medium text-gray-600">Total</th>
                <th className="text-sm font-medium text-gray-600 text-right">
                  {intlCurrency(requestCode.request.amount!)}
                </th>
              </tr>
            </tbody>
          </table>
        ) : null}

        <div className="mt-5">
          <Ctx.Provider value={{ requestCode, paymentIntent }}>
            {((requestCode?.request?.requestedInfo as RequestType[]) || []).map((requestType) => (
              <RequestInfo key={requestType} type={requestType} />
            ))}
            {!!requestCode.request.amount && <RequestPayment />}
          </Ctx.Provider>
        </div>
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
  // ensureExhaustive(type)
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
        return_url: `${getDomain()}/requests/success`,
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
        <PaymentElement
          onReady={() => setReady(true)}
          options={{ paymentMethodOrder: ["apple_pay", "google_pay", "card"] }}
        />
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

      <div className="mt-5 text-center">
        <Typography.Link href="/requests">Cancelar</Typography.Link>
      </div>
    </form>
  )
}
