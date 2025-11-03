/**
 * A utility function that always returns `undefined`, useful for declaring
 * uninitialized variables
 *
 * @template T
 * @returns {(T extends () => infer R ? R
 *     : T extends new () => infer R ? R
 *     : never)
 *   | undefined}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function unset(/** @type {T | undefined} */ factory = undefined) {
  return undefined;
}
