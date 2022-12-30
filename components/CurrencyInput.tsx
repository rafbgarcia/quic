import { Form, InputNumber } from "antd"
import { amountHelperTxt, MAX_AMOUNT, MIN_AMOUNT } from "../lib/amount"

export function CurrencyInput({ label }: { label?: string }) {
  label ||= "Valor a pagar"

  return (
    <Form.Item
      name="amount"
      label={label}
      rules={[
        { type: "number", required: true, message: "informe um valor" },
        { type: "number", min: MIN_AMOUNT, message: amountHelperTxt },
        { type: "number", max: MAX_AMOUNT, message: amountHelperTxt },
      ]}
      validateTrigger="onBlur"
    >
      <InputNumber
        className="w-full"
        maxLength={9}
        addonBefore="R$"
        placeholder="0,00"
        controls={false}
        formatter={(val) => formatCurrency(val as unknown as string)}
      />
    </Form.Item>
  )
}

function formatCurrency(value: string) {
  let v = parseFloat(value)
  if (Number.isNaN(v)) return ""

  return (v / 100).toFixed(2).replace(".", ",")
}
