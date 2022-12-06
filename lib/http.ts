export const post = (url: string, data: any = {}) => {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json())
}
