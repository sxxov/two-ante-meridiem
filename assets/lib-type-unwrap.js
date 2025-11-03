/**
 * @template T
 * @returns {NonNullable<T>}
 */
export function unwrap(/** @type {T} */ value) {
  return /** @type {NonNullable<T>} */ (value);
}
