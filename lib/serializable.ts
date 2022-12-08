export function makeSerializable(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}
