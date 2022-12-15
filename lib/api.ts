import { message } from "antd"

export const createRequest = (data: any) => post("/api/admin/requests/create", data)

export const post = (path: string, data: any = {}) => {
  // const [messageApi, contextHolder] = message.useMessage()
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .catch((e) => message.info(e.message))
}
