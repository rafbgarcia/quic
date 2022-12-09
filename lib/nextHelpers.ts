export function redirectResult(path: string, msg: string | undefined) {
  return {
    redirect: {
      destination: path + (msg ? `?message=${msg}` : ""),
      permanent: false,
    },
  }
}
