const alg = {
  name: "AES-GCM",
  iv: new Uint8Array(JSON.parse(process.env.ENCRYPTION_IV!)),
}
const pwUtf8 = new TextEncoder().encode(process.env.ENCRYPTION_SECRET!)

export async function encrypt(data: any) {
  const encodedData = new TextEncoder().encode(JSON.stringify(data))
  const pwHash = await crypto.subtle.digest("SHA-256", pwUtf8)
  const encrpytKey = await crypto.subtle.importKey("raw", pwHash, alg, false, ["encrypt"])

  return { pwHash, data: await crypto.subtle.encrypt(alg, encrpytKey, encodedData) }
}

export async function decrypt(encrypted: ArrayBuffer, pwHash: ArrayBuffer) {
  const decryptKey = await crypto.subtle.importKey("raw", pwHash, alg, false, ["decrypt"])
  const ptBuffer = await crypto.subtle.decrypt(alg, decryptKey, encrypted)

  return new TextDecoder().decode(ptBuffer)
}
