import { CheckOutlined, InfoCircleOutlined } from "@ant-design/icons"
import { Business, PaymentMethod, Request } from "@prisma/client"
import { CanMakePaymentResult, loadStripe, PaymentRequest, Stripe } from "@stripe/stripe-js"
import { Button, Form, message, Popover, Skeleton } from "antd"
import classNames from "classnames"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import StripeServer from "stripe"
import { extraFee, intlCurrency } from "../../lib/amount"
import { RequestModule } from "../../lib/api/RequestModule"
import { CurrencyInput } from "../CurrencyInput"

import applePayMark from "../../images/apple_pay_mark.svg"
import googlePayMark from "../../images/google_pay_mark.svg"
import pixMark from "../../images/pix_mark.svg"
import { post } from "../../lib/api"
import { PaymentMethodModule } from "../../lib/api/PaymentMethodModule"

type Req = Request & { business: Business }

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const paymentMethodMap = {
  [PaymentMethod.applePay]: { icon: applePayMark, label: "Apple Pay" },
  [PaymentMethod.googlePay]: { icon: googlePayMark, label: "Google Pay" },
  [PaymentMethod.pix]: { icon: pixMark, label: "Pix" },
}

export function RequestPayment({ request }: { request: Req }) {
  const [needsAmount, setNeedsAmount] = useState(RequestModule.needsPaymentAmount(request))
  const setAmount = (values: any) => {
    request.amount = values.amount
    setNeedsAmount(false)
  }

  if (needsAmount) {
    return <NewPaymentIntentForm onSubmit={setAmount} />
  }
  return <CheckoutForm request={request} />
}

function PaymentMethodEl({
  paymentMethod,
  selected,

  onSelect,
}: {
  paymentMethod: PaymentMethod
  selected: boolean
  onSelect: any
}) {
  const map = paymentMethodMap[paymentMethod]
  return (
    <div
      onClick={() => onSelect(paymentMethod)}
      className={classNames("flex items-center gap-2 border rounded-md p-4 cursor-pointer transition-all", {
        "bg-white border-blue-600": selected,
        "hover:shadow-sm border-gray-300 ": !selected,
      })}
    >
      <Image src={map.icon} alt={map.label} height={25} />
      <span>{map.label}</span>
      {selected && <CheckOutlined className="ml-auto text-blue-600" />}
    </div>
  )
}

const CheckoutForm = ({ request }: { request: Req }) => {
  const router = useRouter()
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [waiting, setWaiting] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest>()
  const [canMakePaymentResult, setCanMakePaymentResult] = useState<CanMakePaymentResult | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.pix)

  useEffect(() => {
    stripePromise.then((stripe) => {
      if (stripe) {
        const pr = stripe.paymentRequest({
          country: "BR",
          currency: "brl",
          total: {
            label: request.business.name,
            amount: request.amount! + extraFee(request),
          },
        })
        pr.canMakePayment().then((result) => {
          setStripe(stripe)
          setPaymentRequest(pr)
          setCanMakePaymentResult(result)

          if (result?.applePay) setSelectedPaymentMethod(PaymentMethod.applePay)
          else if (result?.googlePay) setSelectedPaymentMethod(PaymentMethod.googlePay)
          else setSelectedPaymentMethod(PaymentMethod.pix)
        })
        pr.on("cancel", () => setWaiting(false))
        pr.on("paymentmethod", async (ev: any) => {
          const pi = (await post("/api/requests/create_pi", {
            id: request.id,
            amount: request.amount,
            paymentMethod: selectedPaymentMethod,
          })) as StripeServer.Response<StripeServer.PaymentIntent>

          const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
            pi.client_secret!,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          )

          if (confirmError) {
            ev.complete("fail")
          } else {
            ev.complete("success")
            if (paymentIntent.status === "requires_action") {
              const { error } = await stripe.confirmCardPayment(paymentIntent.client_secret!)
              if (error) {
                message.error(error.message)
              } else {
                router.push(encodeURI(`/${paymentIntent.id}/success`))
              }
            } else {
              router.push(encodeURI(`/${paymentIntent.id}/success`))
            }
          }
        })
      }
    })
  }, [stripe, request.amount])

  if (!stripe || !paymentRequest) {
    return <Skeleton />
  }

  const onSubmit = async () => {
    setWaiting(true)

    if (PaymentMethodModule.isCard(selectedPaymentMethod)) {
      paymentRequest.show()
    } else if (selectedPaymentMethod === PaymentMethod.pix) {
      const pi = (await post("/api/requests/create_pi", {
        id: request.id,
        amount: request.amount,
        paymentMethod: selectedPaymentMethod,
      })) as StripeServer.Response<StripeServer.PaymentIntent>

      const { error, paymentIntent } = await stripe!.confirmPixPayment(pi.client_secret!, {
        payment_method: {},
      })

      setWaiting(false)

      if (error) {
        message.info(error?.message)
      } else if (paymentIntent?.status === "succeeded") {
        router.push(encodeURI(`/${paymentIntent.id}/success`))
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="font-medium text-sm mb-1">Resumo de valores</h3>
        <AmountDetails request={request} paymentMethod={selectedPaymentMethod} />
      </section>

      <section>
        <h3 className="font-medium text-sm mb-1">Formas de pagamento</h3>
        <div className="flex flex-col gap-2">
          {canMakePaymentResult?.applePay && (
            <PaymentMethodEl
              paymentMethod={PaymentMethod.applePay}
              selected={selectedPaymentMethod === PaymentMethod.applePay}
              onSelect={setSelectedPaymentMethod}
            />
          )}
          {canMakePaymentResult?.googlePay && (
            <PaymentMethodEl
              paymentMethod={PaymentMethod.googlePay}
              selected={selectedPaymentMethod === PaymentMethod.googlePay}
              onSelect={setSelectedPaymentMethod}
            />
          )}
          <PaymentMethodEl
            paymentMethod={PaymentMethod.pix}
            selected={selectedPaymentMethod === PaymentMethod.pix}
            onSelect={setSelectedPaymentMethod}
          />
        </div>
      </section>
      <Button onClick={onSubmit} size="large" type="primary" block loading={waiting}>
        Pagar
      </Button>
    </div>
  )
}

function AmountDetails({ request, paymentMethod }: { request: Req; paymentMethod: PaymentMethod }) {
  if (request.extraFeePercent && PaymentMethodModule.isCard(paymentMethod)) {
    return (
      <table className="w-full text-left text-sm">
        <tbody>
          <tr className="text-gray-600">
            <td>Subtotal</td>
            <td className="text-right">{intlCurrency(request.amount!)}</td>
          </tr>
          <tr className="text-gray-500">
            <td>
              <div className="flex items-center gap-1">
                Taxa do cartão
                <Popover
                  placement="bottomRight"
                  className="flex align-center gap-1"
                  content={
                    <p>
                      O estabelecimento optou por dividir a <br />
                      taxa cobrada pelo pagamento com <br />
                      cartão de crédito.
                    </p>
                  }
                >
                  <InfoCircleOutlined />
                </Popover>
              </div>
            </td>
            <td className="text-right">{intlCurrency(extraFee(request))}</td>
          </tr>
          <tr className="text-gray-700">
            <td>Total</td>
            <td className="text-gray-700 text-right">{intlCurrency(request.amount! + extraFee(request))}</td>
          </tr>
        </tbody>
      </table>
    )
  }

  return (
    <table className="w-full text-sm text-gray-700">
      <tbody>
        <tr>
          <td>Total</td>
          <td className="text-right">{intlCurrency(request.amount!)}</td>
        </tr>
      </tbody>
    </table>
  )
}

function NewPaymentIntentForm({ onSubmit }: { onSubmit: (n: number) => any }) {
  return (
    <Form onFinish={onSubmit} layout="vertical" className="max-w-md" requiredMark={false}>
      <CurrencyInput label="Informe o valor" />
      <Button type="primary" size="large" htmlType="submit" block>
        Continuar
      </Button>
    </Form>
  )
}
