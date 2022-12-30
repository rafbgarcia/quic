import { InfoCircleOutlined } from "@ant-design/icons"
import { LockClosedIcon } from "@heroicons/react/24/outline"
import { Business, Request } from "@prisma/client"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Alert, Button, Form, Popover, Skeleton, Spin, Typography } from "antd"
import { useEffect, useState } from "react"
import Stripe from "stripe"
import { extraFee, intlCurrency } from "../../lib/amount"
import { post } from "../../lib/api"
import { getDomain } from "../../lib/api/req"
import { RequestModule } from "../../lib/api/RequestModule"
import { CurrencyInput } from "../CurrencyInput"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type Req = Request & { business: Business }

export function RequestPayment({ request }: { request: Req }) {
  const [needsAmount, setNeedsAmount] = useState(RequestModule.needsPaymentAmount(request))
  const handleNewPi = (values: any) => {
    request.amount = values.amount
    setNeedsAmount(false)
  }

  if (needsAmount) {
    return <NewPaymentIntentForm onSubmit={handleNewPi} />
  }

  return (
    <>
      <AmountDetails request={request} />
      <PaymentForm request={request} />
    </>
  )
}

function AmountDetails({ request }: { request: Req }) {
  if (!request.extraFeePercent) {
    return null
  }

  return (
    <table className="w-full text-left">
      <tbody className="divide-y divide-gray-200">
        <tr className="font-medium">
          <td className="whitespace-nowrap text-sm text-gray-600">Subtotal</td>
          <td className="whitespace-nowrap text-sm text-gray-600 text-right">
            {intlCurrency(request.amount!)}
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
                    <p>a taxa do método de pagamento.</p>
                  </>
                }
              >
                <InfoCircleOutlined />
              </Popover>
            </div>
          </td>
          <td className="whitespace-nowrap text-sm text-gray-600 text-right">
            {intlCurrency(extraFee(request))}
          </td>
        </tr>
        <tr>
          <th className="text-sm font-medium text-gray-600">Total</th>
          <th className="text-sm font-medium text-gray-600 text-right">
            {intlCurrency(request.amount! + extraFee(request))}
          </th>
        </tr>
      </tbody>
    </table>
  )
}

function PaymentForm({ request }: { request: Req }) {
  const [pi, setPi] = useState<Stripe.Response<Stripe.PaymentIntent> | null>(null)

  useEffect(() => {
    post(`/api/requests/create_pi`, { id: request.id, amount: request.amount }).then(setPi)
  }, [request.id, request.amount, setPi])

  if (!pi) return <Skeleton className="m-6" />

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: pi.client_secret!,
        locale: "pt-BR",
      }}
    >
      <CheckoutForm request={request} pi={pi} />
    </Elements>
  )
}

const CheckoutForm = ({ request, pi }: { request: Req; pi: Stripe.Response<Stripe.PaymentIntent> }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [waiting, setWaiting] = useState(false)
  const [ready, setReady] = useState(false)

  if (!stripe || !elements) {
    return <Spin size="large" />
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setWaiting(true)

    const msg = `Pagamento de ${intlCurrency(pi.amount)} para ${request.business.name} concluído.`
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: encodeURI(`${getDomain()}/${request.code}/success?msg=${msg}`),
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
        Pagar {intlCurrency(request.amount! + extraFee(request))}
      </Button>

      <div className="mt-5 text-center">
        <Typography.Link href="/code">Cancelar</Typography.Link>
      </div>
    </form>
  )
}

function NewPaymentIntentForm({ onSubmit }: { onSubmit: (n: number) => any }) {
  return (
    <Form onFinish={onSubmit} layout="vertical" className="max-w-md" requiredMark>
      <CurrencyInput label="Informe o valor" />
      <Button type="primary" htmlType="submit" block>
        Continuar
      </Button>
    </Form>
  )
}
