/**
 * Ensures we're exhaustive handling all values.
 * If we, for example, add a value to an enum and forget
 * to handle it, Typescript will raise a compile error.
 */
export function ensureExhaustive(val: never): never {
  throw new Error(`Please handle the value "${val}"`)
}
