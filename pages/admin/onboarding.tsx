import { InfoCircleOutlined } from "@ant-design/icons"
import { CheckIcon } from "@heroicons/react/24/solid"
import { Alert, Button, Card, Popover } from "antd"
import classnames from "classnames"
import { GetServerSidePropsContext } from "next"
import Head from "next/head"
import Link from "next/link"
import { useState } from "react"
import Stripe from "stripe"
import AdminLayout from "../../components/AdminLayout"
import { getLoginSession } from "../../lib/api/auth"
import { selectedBusiness } from "../../lib/api/business"
import { makeSerializable } from "../../lib/serializable"
import { hasMissingRequirements } from "../../lib/stripeAccount"

type Props = Awaited<ReturnType<typeof getServerSideProps>>["props"]

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const admin = (await getLoginSession(req))!.admin
  const business = makeSerializable(await selectedBusiness(admin))

  return {
    props: { business },
  }
}

function getCurrentStep(stripeMeta?: Stripe.Account) {
  if (stripeMeta?.payouts_enabled && stripeMeta?.charges_enabled) {
    return steps[2]
  }
  if (!stripeMeta?.details_submitted) {
    return steps[0]
  }
  return steps[1]
}

export default function Onboarding({ business }: Props) {
  const currentStep = getCurrentStep(business?.stripeMeta as any)

  return (
    <>
      <Head>
        <title>Onboarding parceiro</title>
      </Head>

      <AdminLayout disableMenu pageTitle="Cadastre seu negócio">
        <div>
          <div className="mb-6">
            <Steps currentStep={currentStep} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card bordered={false}>
              <Step step={currentStep} business={business} />
            </Card>
            <Alert
              showIcon
              description={
                <>
                  <p className="mb-2">
                    Por motivos de segurança, utilizamos a Stripe
                    <Popover content={StripeInfo} title="Sobre a Stripe">
                      <InfoCircleOutlined className="ml-1 mr-2 relative -top-1 text-blue-700" />
                    </Popover>
                    para validar os dados do seu negócio e processar pagamentos.
                  </p>
                  <p className="mb-2">
                    Você pode usar o Quic tanto como empresa quanto como profissional autonomo.
                  </p>
                </>
              }
              message="Saiba mais"
            />
          </div>
        </div>
      </AdminLayout>
    </>
  )
}

function Step({ step, business }: { step: typeof steps[0]; business: Props["business"] }) {
  const [clicked, setClicked] = useState(false)
  const didClick = () => setClicked(true)

  if (step.id === 1) {
    return (
      <>
        {hasMissingRequirements(business?.stripeMeta as any) && (
          <Alert
            className="mb-4"
            showIcon
            type="info"
            message="Seu cadastro está incompleto"
            description="Seu progresso está salvo. Clique no botão ao lado para continuar de onde parou."
            action={
              <Link href="/api/admin/stripe/onboarding">
                <Button onClick={didClick} loading={clicked} type="primary" className="mb-4">
                  Continuar cadastro na Stripe
                </Button>
              </Link>
            }
          />
        )}
        <h3 className="text-xl mb-2">Faça seu cadastro</h3>

        <p className="mb-2">Seu progresso é salvo a cada etapa e você pode voltar de onde parou.</p>
        <p className="mb-4">Ao finalizar, você será redirecionado de volta para cá.</p>

        <Link href="/api/admin/stripe/onboarding">
          <Button onClick={didClick} loading={clicked} type="primary">
            {hasMissingRequirements(business?.stripeMeta as any)
              ? "Continuar cadastro na Stripe"
              : "Iniciar cadastro na Stripe"}
          </Button>
        </Link>
      </>
    )
  }
  if (step.id === 2) {
    if (hasMissingRequirements(business?.stripeMeta as any)) {
      return (
        <>
          <h3 className="text-xl mb-2">Ação necessária</h3>
          <p className="mb-2">
            Você tem pendencias no cadastro com a Stripe. Clique no botão abaixo para visualizar.
          </p>
          <Link href="/api/admin/stripe/onboarding">
            <Button onClick={didClick} loading={clicked} type="primary">
              Ver pendencias
            </Button>
          </Link>
        </>
      )
    }
    return (
      <>
        <h3 className="text-xl mb-2">Cadastro completo</h3>
        <p className="mb-2">
          Agora é só aguardar a Stripe validar suas informações. Este processo pode levar até 3 dias úteis.
        </p>
        <p className="mb-2">Fique tranquilo, avisaremos por E-mail ou SMS sobre qualquer atualização.</p>
        <p className="mb-5">Você já pode fechar esta aba.</p>
        <Link href="/api/admin/stripe/onboarding">
          <Button onClick={didClick} loading={clicked} type="primary">
            Checar pendencias
          </Button>
        </Link>
      </>
    )
  }

  return (
    <>
      <h3 className="text-xl mb-2">Cadastro completo!</h3>
      <p className="mb-4">Você já pode começar a usar o Quic.</p>
      <Link href="/admin">
        <Button type="primary">Ir para o Quic</Button>
      </Link>
    </>
  )
}

function Steps({ currentStep }: { currentStep: typeof steps[0] }) {
  return (
    <div className="lg:border-t lg:border-b lg:border-gray-200">
      <nav className="" aria-label="Progress">
        <ol
          role="list"
          className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-gray-200"
        >
          {steps.map((step, stepIdx) => (
            <li key={step.id} className="relative overflow-hidden lg:flex-1 bg-gray-50">
              <div
                className={classnames(
                  stepIdx === 0 ? "border-b-0 rounded-t-md" : "",
                  stepIdx === steps.length - 1 ? "border-t-0 rounded-b-md" : "",
                  "border border-gray-200 overflow-hidden lg:border-0"
                )}
              >
                {step.id < currentStep.id || currentStep.id === 3 ? (
                  <div className="group">
                    <span
                      className="absolute top-0 left-0 h-full w-1 bg-transparent group-hover:bg-gray-200 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                      aria-hidden="true"
                    />
                    <span
                      className={classnames(
                        stepIdx !== 0 ? "lg:pl-9" : "",
                        "px-6 py-5 flex items-start text-sm font-medium"
                      )}
                    >
                      <span className="flex-shrink-0">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                          <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                        </span>
                      </span>
                      <span className="mt-0.5 ml-4 flex min-w-0 flex-col">
                        <span className="text-sm font-medium">{step.name}</span>
                        <span className="text-sm font-medium text-gray-500">{step.description}</span>
                      </span>
                    </span>
                  </div>
                ) : step === currentStep ? (
                  <div aria-current="step">
                    <span
                      className="absolute top-0 left-0 h-full w-1 bg-blue-600 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                      aria-hidden="true"
                    />
                    <span
                      className={classnames(
                        stepIdx !== 0 ? "lg:pl-9" : "",
                        "px-6 py-5 flex items-start text-sm font-medium"
                      )}
                    >
                      <span className="flex-shrink-0">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-600">
                          <span className="text-blue-600">{step.id}</span>
                        </span>
                      </span>
                      <span className="mt-0.5 ml-4 flex min-w-0 flex-col">
                        <span className="text-sm font-medium text-blue-600">{step.name}</span>
                        <span className="text-sm font-medium text-gray-500">{step.description}</span>
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="group">
                    <span
                      className="absolute top-0 left-0 h-full w-1 bg-transparent group-hover:bg-gray-200 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                      aria-hidden="true"
                    />
                    <span
                      className={classnames(
                        stepIdx !== 0 ? "lg:pl-9" : "",
                        "px-6 py-5 flex items-start text-sm font-medium"
                      )}
                    >
                      <span className="flex-shrink-0">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300">
                          <span className="text-gray-500">{step.id}</span>
                        </span>
                      </span>
                      <span className="mt-0.5 ml-4 flex min-w-0 flex-col">
                        <span className="text-sm font-medium text-gray-500">{step.name}</span>
                        <span className="text-sm font-medium text-gray-500">{step.description}</span>
                      </span>
                    </span>
                  </div>
                )}

                {stepIdx !== 0 ? (
                  <>
                    {/* Separator */}
                    <div className="absolute inset-0 top-0 left-0 hidden w-3 lg:block" aria-hidden="true">
                      <svg
                        className="h-full w-full text-gray-300"
                        viewBox="0 0 12 82"
                        fill="none"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0.5 0V31L10.5 41L0.5 51V82"
                          stroke="currentcolor"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    </div>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}

const steps = [
  {
    id: 1,
    name: "Cadastro",
    description: "Informe os dados do seu negócio",
  },
  {
    id: 2,
    name: "Validação dos dados",
    description: "Aguarde a confirmação de seus dados",
  },
  {
    id: 3,
    name: "Pronto!",
    description: "Comece a usar o Quic",
  },
]

const StripeInfo = (
  <>
    <p className="mb-2">
      A Stripe é uma renomada e segura infraestrutura
      <br /> global de pagamentos.
    </p>
    <p className="mb-2">
      Utilizamos a plataforma para manter conformidade <br />
      com os Padrões de Segurança de Dados do Setor <br />
      de Cartões de Pagamento (PCI DSS).
    </p>
    <p>
      Saiba mais em: <br />
      <Link href="https://stripe.com/br/guides/pci-compliance" target={"_blank"}>
        https://stripe.com/br/guides/pci-compliance
      </Link>
    </p>
  </>
)
