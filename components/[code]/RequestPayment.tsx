import { InfoCircleOutlined } from "@ant-design/icons"
import { Business, Request } from "@prisma/client"
import { Elements, useElements, useStripe } from "@stripe/react-stripe-js"
import { CanMakePaymentResult, loadStripe, PaymentRequest } from "@stripe/stripe-js"
import { Button, Form, message, Popover, Skeleton, Typography } from "antd"
import classNames from "classnames"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Stripe from "stripe"
import { extraFee, intlCurrency } from "../../lib/amount"
import { post } from "../../lib/api"
import { RequestModule } from "../../lib/api/RequestModule"
import { CurrencyInput } from "../CurrencyInput"

import applePayMark from "../../images/apple_pay_mark.svg"
import googlePayMark from "../../images/google_pay_mark.svg"
import pixPayMark from "../../images/pix_mark.svg"

type Req = Request & { business: Business }

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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
    post("/api/requests/create_pi", {
      id: request.id,
      amount: request.amount,
    }).then(setPi)
  }, [request.id, request.amount, setPi])

  if (!pi) return <Skeleton />

  return (
    <>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret: pi.client_secret!,
          locale: "pt-BR",
        }}
      >
        <CheckoutForm request={request} pi={pi} />
      </Elements>
    </>
  )
}

// const CheckoutForm2 = ({ request, pi }: { request: Req; pi: Stripe.Response<Stripe.PaymentIntent> }) => {
//   const router = useRouter()
//   const stripe = useStripe()
//   const onSubmit = async (e: any) => {
//     e.preventDefault()

//     const { error, paymentIntent } = await stripe!.confirmPixPayment(pi.client_secret!, {
//       payment_method: {},
//     })

//     if (error) {
//       message.info(error?.message)
//     } else if (paymentIntent?.status !== "succeeded") {
//       return
//     } else {
//       router.push(encodeURI(`/${request.businessId}/success?payment_intent=${paymentIntent.id}`))
//     }
//   }

//   return (
//     <form className="mb-5" onSubmit={onSubmit}>
//       <Button
//         className="flex items-center justify-center gap-1"
//         htmlType="submit"
//         size="large"
//         type="primary"
//         block
//         icon={<LockClosedIcon className="w-4" />}
//       >
//         Pagar com Pix {intlCurrency(request.amount! + extraFee(request))}
//       </Button>
//     </form>
//   )
// }

const getWallet = (result: CanMakePaymentResult | null) => {
  if (result?.applePay) {
    return { icon: applePayMark, label: "Apple Pay" }
  } else if (result?.googlePay) {
    return { icon: googlePayMark, label: "Google Pay" }
  }
}

enum PaymentMethod {
  pix,
  card,
}

function PaymentMethodEl({
  icon,
  label,
  selected,
  extraFeePercent,
  onSelect,
  paymentMethod,
}: {
  icon: any
  label: string
  selected: boolean
  extraFeePercent?: number | null
  onSelect: any
  paymentMethod: PaymentMethod
}) {
  const onClick = () => {
    onSelect(paymentMethod)
  }
  return (
    <div
      onClick={onClick}
      className={classNames("border rounded-md p-4 cursor-pointer transition-all", {
        "bg-white border-blue-600": selected,
        "hover:shadow-sm border-gray-300 ": !selected,
      })}
    >
      <div className="flex items-center gap-2">
        <Image src={icon} alt={label || ""} height={25} />
        <span>{label}</span>
        {selected && extraFeePercent && (
          <Popover
            placement="bottomLeft"
            className="ml-auto flex align-center gap-1"
            content={
              <>
                <p>Esta taxa não é do Quic.</p>
                <p>
                  O estabelecimento acrescentou este <br />
                  percentual para suavizar a taxa de 4% <br />
                  cobrada em pagamentos com cartão.
                </p>
              </>
            }
          >
            <span className="text-sm text-gray-500">
              +{RequestModule.intlExtraFeePercent(extraFeePercent)}
            </span>
            <InfoCircleOutlined className="text-gray-500 mt-0.5" />
          </Popover>
        )}
      </div>
    </div>
  )
}

const CheckoutForm = ({ request, pi }: { request: Req; pi: Stripe.Response<Stripe.PaymentIntent> }) => {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [waiting, setWaiting] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest>()
  const [canMakePayment, setCanMakePayment] = useState<CanMakePaymentResult | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.card)

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: "BR",
        currency: "brl",
        total: {
          label: "Total",
          amount: request.amount!,
        },
      })
      pr.canMakePayment().then((result) => {
        setPaymentRequest(pr)
        setCanMakePayment(result)
      })
    }
  }, [stripe, request.amount])

  if (!stripe || !elements || !paymentRequest) {
    return <Skeleton />
  }

  paymentRequest.on("paymentmethod", async (ev: any) => {
    const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
      pi.client_secret!,
      { payment_method: ev.paymentMethod.id },
      { handleActions: false }
    )

    setWaiting(false)

    if (confirmError) {
      ev.complete("fail")
    } else {
      ev.complete("success")
      if (paymentIntent.status === "requires_action") {
        const { error } = await stripe.confirmCardPayment(paymentIntent.client_secret!)
        if (error) {
          message.error(error.message)
        } else {
          router.push(encodeURI(`/${request.businessId}/success?payment_intent=${paymentIntent.id}`))
        }
      } else {
        router.push(encodeURI(`/${request.businessId}/success?payment_intent=${paymentIntent.id}`))
      }
    }
  })

  const wallet = getWallet(canMakePayment)

  const onSubmit = async () => {
    setWaiting(true)
    if (paymentMethod === PaymentMethod.pix) {
      const { error, paymentIntent } = await stripe!.confirmPixPayment(pi.client_secret!, {
        payment_method: {},
      })
      setWaiting(false)

      if (error) {
        message.info(error?.message)
      } else if (paymentIntent?.status !== "succeeded") {
        return
      } else {
        router.push(encodeURI(`/${request.businessId}/success?payment_intent=${paymentIntent.id}`))
      }
    } else if (paymentMethod === PaymentMethod.card) {
      paymentRequest.show()
    }
  }

  return (
    <>
      <h3 className="font-medium text-sm mb-2">Formas de pagamento</h3>
      <section className="flex flex-col gap-2">
        {canMakePayment && (
          <PaymentMethodEl
            paymentMethod={PaymentMethod.card}
            icon={wallet!.icon}
            label={wallet!.label}
            extraFeePercent={request.extraFeePercent}
            selected={paymentMethod === PaymentMethod.card}
            onSelect={setPaymentMethod}
          />
        )}
        <PaymentMethodEl
          paymentMethod={PaymentMethod.pix}
          icon={pixPayMark}
          label="Pix"
          selected={paymentMethod === PaymentMethod.pix}
          onSelect={setPaymentMethod}
        />
      </section>

      <Button onClick={onSubmit} className="mt-4" size="large" type="primary" block loading={waiting}>
        Pagar
      </Button>

      <div className="mt-5 text-center">
        <Typography.Link href="/">Cancelar</Typography.Link>
      </div>
    </>
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
